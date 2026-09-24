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
        :class="{ 'heat-card-muted': mutedHeats.has(heatIdx) }"
      >
        <!-- Plain div so we control the flex layout fully -->
        <div class="card-body">
          <!-- Top: label + round info + mark-out toggle -->
          <div class="card-top row justify-between items-baseline">
            <span class="heat-label">{{ heatLabel(heatIdx + 1) }}</span>
            <div class="row items-center q-gutter-xs">
              <span class="round-info text-grey-7">
                Round {{ heatRoundIndex(heatIdx) + 1 }} · {{ formatMMSS(heatTargetSec(heatIdx)) }}
              </span>
              <q-btn
                flat dense round size="sm"
                :icon="mutedHeats.has(heatIdx) ? 'volume_off' : 'volume_up'"
                :color="mutedHeats.has(heatIdx) ? 'negative' : 'grey-6'"
                @click="toggleMute(heatIdx)"
              >
                <q-tooltip>{{ mutedHeats.has(heatIdx) ? 'Swimmer marked out — tap to re-include' : 'Mark swimmer out (mute + stop timer)' }}</q-tooltip>
              </q-btn>
            </div>
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
import { useWakeLock } from 'src/composables/useWakeLock';

const model = useBeepTestModel();

const running = ref(false);
useWakeLock(running);
const baseStartMs = ref<number | null>(null);
// Reactive clock — every tick sets this, driving all template re-renders
const nowMs = ref(Date.now());
const tickTimer = ref<ReturnType<typeof setInterval> | null>(null);

type OverlayState = { visible: boolean; title: string; number: number };
const overlay = reactive<OverlayState>({ visible: false, title: '', number: 3 });

// Heats marked "out" — their sound is silenced and their timer stops advancing
const mutedHeats = reactive<Set<number>>(new Set());
const toggleMute = (heatIdx: number) => {
  if (mutedHeats.has(heatIdx)) mutedHeats.delete(heatIdx);
  else mutedHeats.add(heatIdx);
};

// Persistent AudioContext — avoids cold-start latency on each beep
let audioCtx: AudioContext | null = null;
// Shared output bus: everything runs through a limiter so the loud "alarm"
// style can be driven hard without harsh digital clipping, and instead
// gets squashed into a dense, consistently loud signal (same trick alarms/
// broadcast audio use to sound louder on small speakers).
let masterGain: GainNode | null = null;
let limiter: DynamicsCompressorNode | null = null;

const initAudio = () => {
  if (audioCtx) return;
  try {
    const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext || w.webkitAudioContext;
    if (!Ctor) return;
    audioCtx = new Ctor();
    limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -24;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.1;
    limiter.connect(audioCtx.destination);
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(limiter);
  } catch { /* no-op */ }
};

const ensureAudio = () => {
  if (!audioCtx || !masterGain) return false;
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
  g.connect(masterGain!);
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
    g.connect(masterGain!);
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
  g.connect(masterGain!);
  osc.start(t);
  osc.stop(t + durationSec);
};

// GO signal (beep mode): long sustained sine beep — traditional buzzer feel.
const playGoBeep = () => playFlatBeep(1400, 0.6, 0.35);

// Sharp square-wave pulse — used for alarm mode. Square waves are rich in
// high harmonics (like a smoke detector/referee whistle) and sit in the
// 2-3 kHz range where the ear is most sensitive, so they cut through pool
// echo and splash noise far better than the sine/sawtooth tones above.
const playAlarmPulse = (hz: number, durationSec: number, gain: number) => {
  if (!ensureAudio()) return;
  const t = audioCtx!.currentTime;
  const osc = audioCtx!.createOscillator();
  const g = audioCtx!.createGain();
  osc.type = 'square';
  osc.frequency.value = hz;
  g.gain.setValueAtTime(gain, t);
  g.gain.setValueAtTime(gain, t + durationSec * 0.7);
  g.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  osc.connect(g);
  g.connect(masterGain!);
  osc.start(t);
  osc.stop(t + durationSec);
};

// GO signal (alarm mode): rapid two-tone siren warble, the classic
// emergency-alarm pattern — much harder to miss/tune out than a steady tone.
const playGoAlarm = () => {
  if (!ensureAudio()) return;
  const hiHz = 2800;
  const loHz = 1800;
  const stepSec = 0.09;
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const t = audioCtx!.currentTime + i * stepSec;
    const osc = audioCtx!.createOscillator();
    const g = audioCtx!.createGain();
    osc.type = 'square';
    osc.frequency.value = i % 2 === 0 ? hiHz : loHz;
    g.gain.setValueAtTime(0.9, t);
    g.gain.setValueAtTime(0.9, t + stepSec * 0.85);
    g.gain.exponentialRampToValueAtTime(0.001, t + stepSec);
    osc.connect(g);
    g.connect(masterGain!);
    osc.start(t);
    osc.stop(t + stepSec);
  }
};

const playTone = (type: OscillatorType, hz: number, durationSec: number, gain: number, sustainFrac = 0.7) => {
  if (!ensureAudio()) return;
  const t = audioCtx!.currentTime;
  const osc = audioCtx!.createOscillator();
  const g = audioCtx!.createGain();
  osc.type = type;
  osc.frequency.value = hz;
  g.gain.setValueAtTime(gain, t);
  g.gain.setValueAtTime(gain, t + durationSec * sustainFrac);
  g.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  osc.connect(g);
  g.connect(masterGain!);
  osc.start(t);
  osc.stop(t + durationSec);
};

// Horn mode: a layered fundamental + a closely-dissonant second tone (the
// beating/roughness of real air horns) plus a high presence layer. Aimed at
// external/Bluetooth speakers rather than phone speakers — those have real
// bass extension, so a sustained full-range chord carries far more total
// acoustic energy than a short high-pitched pulse ever could.
const playHornChord = (durationSec: number, gain: number) => {
  playTone('sawtooth', 175, durationSec, gain, 0.75);
  playTone('sawtooth', 233, durationSec, gain * 0.85, 0.75);
  playTone('square', 2400, durationSec, gain * 0.6, 0.75);
};

// GO signal (horn mode): a full second of sustained chord — maximizes total
// energy delivered rather than relying on a sharp, short attack.
const playGoHorn = () => playHornChord(1.0, 0.9);

// Siren mode: a rising/falling pitch glide, like an emergency vehicle —
// continuous pitch movement is harder for the ear to tune out over time
// than a repeated static tone, which matters most on speakers loud enough
// to run for several rounds in a row.
const playSirenSweep = (fromHz: number, toHz: number, durationSec: number, gain: number) => {
  if (!ensureAudio()) return;
  const t = audioCtx!.currentTime;
  const osc = audioCtx!.createOscillator();
  const g = audioCtx!.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(fromHz, t);
  osc.frequency.linearRampToValueAtTime(toHz, t + durationSec);
  g.gain.setValueAtTime(gain, t);
  g.gain.setValueAtTime(gain, t + durationSec * 0.85);
  g.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  osc.connect(g);
  g.connect(masterGain!);
  osc.start(t);
  osc.stop(t + durationSec);
};

// GO signal (siren mode): two full up-down glide cycles — a sustained whoop
// rather than a single blip, for maximum "impossible to miss" effect.
const playGoSiren = () => {
  if (!ensureAudio()) return;
  const t = audioCtx!.currentTime;
  const osc = audioCtx!.createOscillator();
  const g = audioCtx!.createGain();
  osc.type = 'sawtooth';
  const low = 500;
  const high = 1600;
  const legSec = 0.3;
  osc.frequency.setValueAtTime(low, t);
  osc.frequency.linearRampToValueAtTime(high, t + legSec);
  osc.frequency.linearRampToValueAtTime(low, t + legSec * 2);
  osc.frequency.linearRampToValueAtTime(high, t + legSec * 3);
  osc.frequency.linearRampToValueAtTime(low, t + legSec * 4);
  const totalSec = legSec * 4;
  g.gain.setValueAtTime(0.9, t);
  g.gain.setValueAtTime(0.9, t + totalSec * 0.9);
  g.gain.exponentialRampToValueAtTime(0.001, t + totalSec);
  osc.connect(g);
  g.connect(masterGain!);
  osc.start(t);
  osc.stop(t + totalSec);
};

// Thump mode: a percussive click transient plus a fast pitch-dropping
// sub-bass body, like a starting-gun/kick-drum boom. Felt as much as heard —
// exploits the deep bass extension many portable Bluetooth speakers are
// tuned for, and low frequencies carry/are felt through a pool hall better
// than highs.
const playThumpAt = (startOffsetSec: number, durationSec: number, gain: number) => {
  if (!ensureAudio()) return;
  const t = audioCtx!.currentTime + startOffsetSec;

  const clickOsc = audioCtx!.createOscillator();
  const clickGain = audioCtx!.createGain();
  clickOsc.type = 'square';
  clickOsc.frequency.value = 900;
  clickGain.gain.setValueAtTime(gain * 0.5, t);
  clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  clickOsc.connect(clickGain);
  clickGain.connect(masterGain!);
  clickOsc.start(t);
  clickOsc.stop(t + 0.02);

  const osc = audioCtx!.createOscillator();
  const g = audioCtx!.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + durationSec);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  osc.connect(g);
  g.connect(masterGain!);
  osc.start(t);
  osc.stop(t + durationSec);
};

const playThump = (durationSec: number, gain: number) => playThumpAt(0, durationSec, gain);

// GO signal (thump mode): a double boom for extra weight/emphasis
const playGoThump = () => {
  playThumpAt(0, 0.3, 0.95);
  playThumpAt(0.22, 0.4, 0.95);
};

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
  if (mutedHeats.has(heatIdx)) return 'OUT';
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
  if (mutedHeats.has(heatIdx)) return 'Marked out';
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
    if (mutedHeats.has(heatIdx)) continue;
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
    if (model.soundStyle === 'thump') {
      // Thump mode: single boom for 3-2-1, double boom for GO
      if (number === 0) playGoThump();
      else if (number === 1) playThump(0.22, 0.9);
      else playThump(0.16, 0.75);
    } else if (model.soundStyle === 'siren') {
      // Siren mode: short whoop blips for 3-2-1, full glide cycles for GO
      if (number === 0) playGoSiren();
      else if (number === 1) playSirenSweep(700, 1500, 0.22, 0.85);
      else playSirenSweep(600, 1200, 0.16, 0.7);
    } else if (model.soundStyle === 'horn') {
      // Horn mode: short punchy chord blasts for 3-2-1, long sustained chord for GO
      if (number === 0) playGoHorn();
      else if (number === 1) playHornChord(0.22, 0.85);
      else playHornChord(0.16, 0.7);
    } else if (model.soundStyle === 'alarm') {
      // Alarm mode: loud square-wave pulses building to a siren-warble GO signal
      if (number === 0) playGoAlarm();
      else if (number === 1) playAlarmPulse(2600, 0.18, 0.85);
      else playAlarmPulse(2000, 0.15, 0.75);
    } else if (model.soundStyle === 'beep') {
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
  mutedHeats.clear();
  tick();
  tickTimer.value = setInterval(tick, 50);
};

const stop = () => {
  running.value = false;
  baseStartMs.value = null;
  overlay.visible = false;
  mutedHeats.clear();
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
  masterGain = null;
  limiter = null;
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

.heat-card-muted {
  opacity: 0.45;
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
