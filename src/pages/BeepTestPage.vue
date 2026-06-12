<template>
  <q-page class="beep-page column q-pa-xs">
    <!-- Controls row — fixed height, never scrolls -->
    <div class="controls-row row items-center justify-between q-mb-xs">
      <div>
        <div class="text-h6">Beep test</div>
        <div class="text-caption text-grey-7">
          Round {{ leaderRoundIndex + 1 }} · Target {{ formatMMSS(leaderRoundTargetSec) }}
        </div>
      </div>
      <div class="row q-gutter-xs">
        <q-btn color="primary"  icon="play_arrow" label="Start" @click="start" :disable="running" />
        <q-btn color="grey-8"   icon="stop"       label="Stop"  @click="stop"  :disable="!running" />
        <q-btn color="grey-7"   icon="replay"     label="Reset" @click="reset" :disable="running" />
      </div>
    </div>

    <!-- Heat grid — grows to fill remaining screen space -->
    <div ref="gridRef" class="heat-grid col">
      <q-card
        v-for="(_, heatIdx) in heatsArr"
        :key="heatIdx"
        flat
        class="heat-card"
      >
        <!-- Plain div so we control the flex layout fully -->
        <div class="card-body">
          <!-- Top: label + round info -->
          <div class="card-top row justify-between items-baseline">
            <span class="heat-label">{{ heatLabel(heatIdx + 1) }}</span>
            <span class="round-info text-grey-7">
              Round {{ heatRoundIndex(heatIdx) + 1 }} · {{ formatMMSS(heatTargetSec(heatIdx)) }}
            </span>
          </div>

          <!-- Middle: timer centred in all available space -->
          <div class="timer-wrap">
            <div
              class="timer-value"
              :class="{ 'timer-pre-start': isPreStart(heatIdx) }"
              :style="{ fontSize: timerFontSizePx + 'px' }"
            >
              {{ heatDisplay(heatIdx) }}
            </div>
          </div>

          <!-- Bottom: secondary countdown -->
          <div class="next-event text-grey-6" :style="{ fontSize: nextEventFontSizePx + 'px' }">
            {{ heatNextEventStr(heatIdx) }}
          </div>
        </div>
      </q-card>
    </div>

    <!-- Full-screen countdown overlay -->
    <div v-if="overlay.visible" class="countdown-overlay">
      <div class="countdown-inner">
        <div class="countdown-title">{{ overlay.title }}</div>
        <div
          class="countdown-number"
          :class="{ 'countdown-go': overlay.number === 0 }"
        >
          {{ overlay.number }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useBeepTestModel } from 'src/models/beepTestModel';

const model = useBeepTestModel();

const running = ref(false);
const baseStartMs = ref<number | null>(null);
// Reactive clock — every tick sets this, driving all template re-renders
const nowMs = ref(Date.now());
const tickTimer = ref<ReturnType<typeof setInterval> | null>(null);

type OverlayState = { visible: boolean; title: string; number: number };
const overlay = reactive<OverlayState>({ visible: false, title: '', number: 3 });

// Persistent AudioContext — avoids cold-start latency on each beep
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (audioCtx) return;
  try {
    const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext || w.webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  } catch { /* no-op */ }
};

const ensureAudio = () => {
  if (!audioCtx) return false;
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return true;
};

// Rising chirp using sawtooth wave — far richer in harmonics than sine,
// cuts through pool echo/splash much better at the same volume level.
const playChirp = (fromHz: number, toHz: number, durationSec: number, gain: number) => {
  if (!ensureAudio()) return;
  const t = audioCtx!.currentTime;
  const osc = audioCtx!.createOscillator();
  const g = audioCtx!.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(fromHz, t);
  osc.frequency.linearRampToValueAtTime(toHz, t + durationSec);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  osc.connect(g);
  g.connect(audioCtx!.destination);
  osc.start(t);
  osc.stop(t + durationSec);
};

// GO signal (chirp mode): three rapid sawtooth pulses — classic timing-system start pattern.
const playGoChirp = () => {
  if (!ensureAudio()) return;
  const pulseSec = 0.09;
  const gapSec = 0.08;
  for (let i = 0; i < 3; i++) {
    const t = audioCtx!.currentTime + i * (pulseSec + gapSec);
    const osc = audioCtx!.createOscillator();
    const g = audioCtx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 1600;
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + pulseSec);
    osc.connect(g);
    g.connect(audioCtx!.destination);
    osc.start(t);
    osc.stop(t + pulseSec);
  }
};

// Flat sine beep — used for beep mode (traditional pure-tone style).
const playFlatBeep = (hz: number, durationSec: number, gain: number) => {
  if (!ensureAudio()) return;
  const t = audioCtx!.currentTime;
  const osc = audioCtx!.createOscillator();
  const g = audioCtx!.createGain();
  osc.type = 'sine';
  osc.frequency.value = hz;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  osc.connect(g);
  g.connect(audioCtx!.destination);
  osc.start(t);
  osc.stop(t + durationSec);
};

// GO signal (beep mode): long sustained sine beep — traditional buzzer feel.
const playGoBeep = () => playFlatBeep(1400, 0.6, 0.35);

// Beep fires once per displayed countdown digit; resets when overlay hides
let lastPlayedNumber = -1;

const heatsArr = computed(() => {
  const n = Math.max(1, Math.min(10, Math.floor(model.heatsPerRound || 1)));
  return Array.from({ length: n });
});

const targetForRoundIndexSec = (idx: number) => {
  const base = Math.max(1, Math.floor(model.targetTimeSec || 60));
  const dec = Math.max(0, Math.floor(model.decrementPerRoundSec || 0));
  return Math.max(1, base - idx * dec);
};

type RoundInfo = {
  roundIndex: number;
  roundStartMs: number;
  targetSec: number;
  nextRoundStartMs: number;
};

const getRoundInfoAtMs = (ms: number): RoundInfo | null => {
  if (baseStartMs.value == null) return null;
  if (ms < baseStartMs.value) {
    return {
      roundIndex: 0,
      roundStartMs: baseStartMs.value,
      targetSec: targetForRoundIndexSec(0),
      nextRoundStartMs: baseStartMs.value,
    };
  }

  let idx = 0;
  let start = baseStartMs.value;
  while (true) {
    const targetSec = targetForRoundIndexSec(idx);
    const end = start + targetSec * 1000;
    if (ms < end) {
      return { roundIndex: idx, roundStartMs: start, targetSec, nextRoundStartMs: end };
    }
    start = end;
    idx += 1;
    if (idx > 100000) {
      return {
        roundIndex: idx,
        roundStartMs: start,
        targetSec: targetForRoundIndexSec(idx),
        nextRoundStartMs: start + targetForRoundIndexSec(idx) * 1000,
      };
    }
  }
};

const formatMMSS = (secTotal: number) => {
  const sec = Math.max(0, Math.floor(secTotal));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const heatLabel = (heat: number) => `${heat}. swimmer`;

const heatOffsetMs = (heatIdx: number) =>
  heatIdx * Math.max(0, Math.floor(model.heatDelaySec || 0)) * 1000;

// Reads nowMs.value — tracked by Vue for reactive re-renders
const heatNowMs = (heatIdx: number) => nowMs.value - heatOffsetMs(heatIdx);

const heatRoundInfo = (heatIdx: number): { roundIndex: number; targetSec: number } => {
  if (!running.value || baseStartMs.value == null) {
    return { roundIndex: 0, targetSec: targetForRoundIndexSec(0) };
  }
  const hn = heatNowMs(heatIdx);
  if (hn < baseStartMs.value) {
    return { roundIndex: 0, targetSec: targetForRoundIndexSec(0) };
  }
  const info = getRoundInfoAtMs(hn);
  return {
    roundIndex: info?.roundIndex ?? 0,
    targetSec: info?.targetSec ?? targetForRoundIndexSec(0),
  };
};

const heatRoundIndex = (heatIdx: number) => heatRoundInfo(heatIdx).roundIndex;
const heatTargetSec = (heatIdx: number) => heatRoundInfo(heatIdx).targetSec;

const isPreStart = (heatIdx: number) => {
  if (!running.value || baseStartMs.value == null) return false;
  return heatNowMs(heatIdx) < baseStartMs.value;
};

const heatDisplay = (heatIdx: number) => {
  if (!running.value || baseStartMs.value == null) {
    return formatMMSS(targetForRoundIndexSec(0));
  }
  const hn = heatNowMs(heatIdx);
  if (hn < baseStartMs.value) {
    // Negative countdown: -00:03, -00:02, -00:01
    return `-${formatMMSS(Math.ceil((baseStartMs.value - hn) / 1000))}`;
  }
  const info = getRoundInfoAtMs(hn);
  if (!info) return '--:--';
  return formatMMSS(Math.min((hn - info.roundStartMs) / 1000, info.targetSec));
};

// Secondary line shown below the main timer for active rounds only
const heatNextEventStr = (heatIdx: number): string => {
  if (!running.value || baseStartMs.value == null) return '';
  const hn = heatNowMs(heatIdx);
  // Pre-start: main display already shows the countdown as a negative number
  if (hn < baseStartMs.value) return '';
  const info = getRoundInfoAtMs(hn);
  if (!info) return '';
  const secLeft = Math.ceil((info.nextRoundStartMs - hn) / 1000);
  return `Next round in ${formatMMSS(Math.max(0, secLeft))}`;
};

const leaderRoundIndex = computed(() => heatRoundInfo(0).roundIndex);
const leaderRoundTargetSec = computed(() => heatRoundInfo(0).targetSec);

const updateOverlayAndSounds = () => {
  if (!running.value || baseStartMs.value == null) {
    overlay.visible = false;
    lastPlayedNumber = -1;
    return;
  }

  // Two buckets: heats about to start (countdown 3-2-1) and heats that just
  // started (show "0" as GO signal for 600 ms). Upcoming always wins over just-started.
  //
  // Critical: getRoundInfoAtMs() returns the NEW round the instant hn crosses
  // nextRoundStartMs, so msUntil would jump from ~50 ms to ~59000 ms without
  // ever passing through 0. We detect the GO moment via elapsedInRound instead.
  let best: { heatIdx: number; msUntil: number } | null = null;
  let bestJustStarted: { heatIdx: number; elapsedMs: number } | null = null;

  for (let heatIdx = 0; heatIdx < heatsArr.value.length; heatIdx++) {
    const hn = heatNowMs(heatIdx);

    if (hn < baseStartMs.value) {
      // Pre-start: normal positive countdown
      const msUntil = baseStartMs.value - hn;
      if (msUntil > 0 && msUntil <= 3000) {
        if (!best || msUntil < best.msUntil) best = { heatIdx, msUntil };
      }
    } else {
      const info = getRoundInfoAtMs(hn);
      if (!info) continue;
      const elapsedInRound = hn - info.roundStartMs;

      if (elapsedInRound <= 600) {
        // Just entered this round — GO signal
        if (!bestJustStarted || elapsedInRound < bestJustStarted.elapsedMs) {
          bestJustStarted = { heatIdx, elapsedMs: elapsedInRound };
        }
      } else {
        // Mid-round: count down to next round start
        const msUntil = info.nextRoundStartMs - hn;
        if (msUntil > 0 && msUntil <= 3000) {
          if (!best || msUntil < best.msUntil) best = { heatIdx, msUntil };
        }
      }
    }
  }

  const chosen: { heatIdx: number; msUntil: number } | null = best
    ?? (bestJustStarted ? { heatIdx: bestJustStarted.heatIdx, msUntil: -bestJustStarted.elapsedMs } : null);

  if (!chosen) {
    overlay.visible = false;
    lastPlayedNumber = -1;
    return;
  }

  const number = Math.max(0, Math.ceil(chosen.msUntil / 1000));
  overlay.visible = true;
  overlay.title = `${heatLabel(chosen.heatIdx + 1)} starts`;
  overlay.number = number;

  // Sound once per digit change: 3 → 2 → 1 → 0 (GO)
  if (number !== lastPlayedNumber) {
    lastPlayedNumber = number;
    if (model.soundStyle === 'beep') {
      // Beep mode: 3 and 2 share the same frequency, 1 is higher, 0 is a long buzzer
      if (number === 0) playGoBeep();
      else if (number === 1) playFlatBeep(1200, 0.2, 0.3);
      else playFlatBeep(880, 0.15, 0.25);
    } else {
      // Chirp mode: rising sawtooth sweeps, triple-pulse GO
      if (number === 0) playGoChirp();
      else if (number === 1) playChirp(900, 1400, 0.22, 0.32);
      else playChirp(600, 1000, 0.18, 0.25);
    }
  }
};

const tick = () => {
  nowMs.value = Date.now();
  updateOverlayAndSounds();
};

const start = () => {
  if (running.value) return;
  initAudio(); // must happen inside user gesture for iOS
  running.value = true;
  baseStartMs.value = Date.now() + 3000;
  lastPlayedNumber = -1;
  tick();
  tickTimer.value = setInterval(tick, 50);
};

const stop = () => {
  running.value = false;
  baseStartMs.value = null;
  overlay.visible = false;
  if (tickTimer.value) {
    clearInterval(tickTimer.value);
    tickTimer.value = null;
  }
};

const reset = () => { stop(); };

// ─── Font-size calculation ────────────────────────────────────────────────────
// Pure CSS vw/vh can't account for the number of heats, so we measure the
// rendered grid and compute the largest font that fits every card.

const gridRef = ref<HTMLElement | null>(null);
const timerFontSizePx = ref(80);
const nextEventFontSizePx = computed(() =>
  Math.max(13, Math.round(timerFontSizePx.value * 0.17))
);

const updateFontSize = () => {
  const el = gridRef.value;
  if (!el) return;

  const gridW = el.clientWidth;
  const gridH = el.clientHeight;
  const n = heatsArr.value.length;

  // Mirror the CSS grid: 2 columns when landscape + viewport ≥ 600 px, else 1
  const twoCol = window.innerWidth >= 600 && window.innerWidth > window.innerHeight && n > 1;
  const cols = twoCol ? 2 : 1;
  const rows = Math.ceil(n / cols);
  const gap = 12;

  const colW = (gridW - (cols - 1) * gap) / cols;
  const rowH = (gridH - (rows - 1) * gap) / rows;

  // Space inside each card after padding (8 px each side) and fixed chrome
  const cardPad = 16;    // 8 top + 8 bottom (q-pa-sm equivalent)
  const cardTopH = 32;   // heat label + round-info row
  const cardBotH = 24;   // next-event row

  const timerH = rowH - cardPad - cardTopH - cardBotH;
  const timerW = colW - cardPad;

  // "00:00" or "-00:00" → up to 6 bold chars; each ~0.62 em wide on average
  const maxByH = Math.max(0, timerH) * 0.88;
  const maxByW = Math.max(0, timerW) / (6 * 0.62);

  timerFontSizePx.value = Math.max(36, Math.floor(Math.min(maxByH, maxByW)));
};

onMounted(() => {
  void nextTick(updateFontSize);
  window.addEventListener('resize', updateFontSize);
});

watch(() => heatsArr.value.length, () => void nextTick(updateFontSize));

onBeforeUnmount(() => {
  stop();
  window.removeEventListener('resize', updateFontSize);
  void audioCtx?.close();
  audioCtx = null;
});
</script>

<style scoped lang="scss">
// Page is a flex column; grid fills all remaining height
.beep-page {
  height: 100%;
}

.controls-row {
  flex-shrink: 0;
}

// CSS grid — 1 column portrait, 2 columns landscape ≥ 600 px
.heat-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 1fr; // equal-height rows within the available space
  gap: 12px;
  min-height: 0; // let the flex parent shrink this if needed

  @media (orientation: landscape) and (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Cards fill their grid cell
.heat-card {
  min-height: 0;
  height: 100%;
  border: 1px solid grey;
  border-radius: 4px;
}

// Inner layout: flex column so timer-wrap can grow
.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 14px;
  box-sizing: border-box;
}

.card-top {
  flex-shrink: 0;
  margin-bottom: 4px;
}

.heat-label {
  font-size: clamp(14px, 2.5vmin, 22px);
  font-weight: 600;
}

.round-info {
  font-size: clamp(11px, 1.8vmin, 18px);
}

// Timer takes all remaining vertical space; text is centred inside
.timer-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
}

.timer-value {
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
}

.timer-pre-start {
  color: #9e9e9e;
}

// Secondary countdown row
.next-event {
  flex-shrink: 0;
  min-height: 1.3em;
  margin-top: 4px;
}

// ─── Full-screen countdown overlay ───────────────────────────────────────────

.countdown-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-inner {
  text-align: center;
  padding: 24px;
  width: min(900px, 92vw);
}

.countdown-title {
  color: rgba(255, 255, 255, 0.85);
  font-size: clamp(24px, 5vmin, 52px);
  font-weight: 600;
  margin-bottom: 16px;
}

.countdown-number {
  font-size: min(320px, 48vmin);
  font-weight: 900;
  color: #ffeb3b;
  line-height: 1;
  text-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);

  &.countdown-go {
    color: #69f0ae;
  }
}
</style>
