<template>
  <q-page class="test2000-page column q-pa-xs">
    <!-- Controls row — fixed height, never scrolls -->
    <div class="controls-row column q-mb-xs">
      <div>
        <div class="text-h6">2000m test</div>
        <div class="text-caption text-grey-7">
          {{ intervalM }}m per press · Target {{ TARGET_DISTANCE_M }}m
        </div>
      </div>
      <div class="controls-buttons row q-gutter-xs q-mt-xs">
        <q-btn dense color="primary" icon="play_arrow" label="Start" @click="start" :disable="!canStart" />
        <q-btn dense color="grey-8" :icon="stopBtnIcon" :label="stopBtnLabel" @click="onStopClick" :disable="stopBtnDisabled" />
        <q-btn dense color="secondary" icon="list_alt" label="Summary" @click="summaryOpen = true" :disable="!hasAnyLaps" />
      </div>
    </div>

    <!-- Swimmer grid -->
    <div v-if="swimmers.length" class="swimmer-grid col">
      <q-card
        v-for="(s, i) in swimmers"
        :key="i"
        flat
        class="swimmer-card"
        :class="{ 'swimmer-finished': s.finished, 'swimmer-flash': flashIndex === i }"
        @pointerdown="onPointerDown(i)"
        @pointerup="onPointerUp(i)"
        @pointerleave="onPointerCancel(i)"
        @pointercancel="onPointerCancel(i)"
        @contextmenu.prevent
      >
        <div class="card-body">
          <div class="card-top row justify-between items-baseline">
            <span class="swimmer-name">{{ s.name }}</span>
            <span class="lap-count text-grey-7">{{ s.laps }} × {{ intervalM }}m</span>
          </div>

          <div class="timer-wrap">
            <div class="timer-value">{{ formatMMSS(elapsedMs(s) / 1000) }}</div>
          </div>

          <div class="distance-row">
            <span class="text-weight-medium">{{ distanceM(s) }} / {{ TARGET_DISTANCE_M }} m</span>
            <span v-if="!s.finished" class="text-grey-6">
              · {{ remainingM(s) }}m left · {{ remainingLaps(s) }} to go
            </span>
            <span v-else class="text-positive text-weight-medium"> · Finished</span>
          </div>

          <div class="split-row text-grey-6">
            {{ lastSplitMs(s) != null ? `Last split ${formatMMSS(lastSplitMs(s)! / 1000)}` : ' ' }}
          </div>
        </div>
      </q-card>
    </div>

    <div v-else class="col column items-center justify-center text-grey-6">
      <div>No swimmers registered.</div>
      <div>Add names in the settings drawer.</div>
    </div>

    <!-- Summary dialog -->
    <q-dialog v-model="summaryOpen">
      <q-card class="summary-card">
        <q-card-section>
          <div class="text-h6">Summary</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="summary-scroll">
          <div v-if="!swimmers.length" class="text-grey-6">No swimmers started yet.</div>
          <div v-for="(s, i) in swimmers" :key="i" class="q-mb-md">
            <div class="row justify-between items-baseline">
              <span class="text-subtitle1">{{ s.name }}</span>
              <span class="text-caption text-grey-7">
                {{ distanceM(s) }} m · {{ formatMMSS(elapsedMs(s) / 1000) }}<span v-if="s.finished"> (finished)</span>
              </span>
            </div>

            <q-markup-table v-if="s.lapTimestamps.length" dense flat>
              <thead>
                <tr>
                  <th class="text-left">Lap</th>
                  <th class="text-left">Split</th>
                  <th class="text-left">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(ts, lapIdx) in s.lapTimestamps"
                  :key="lapIdx"
                  :class="{ 'text-positive': s.finished && lapIdx === s.lapTimestamps.length - 1 }"
                >
                  <td>{{ lapIdx + 1 }}</td>
                  <td>{{ formatMMSS(splitAt(s, lapIdx) / 1000) }}</td>
                  <td>{{ formatMMSS((ts - (baseStartMs ?? ts)) / 1000) }}</td>
                </tr>
              </tbody>
            </q-markup-table>
            <div v-else class="text-caption text-grey-6">No laps recorded yet.</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useTest2000Model } from 'src/models/test2000Model';
import { useWakeLock } from 'src/composables/useWakeLock';

const model = useTest2000Model();

const TARGET_DISTANCE_M = 2000;

type Swimmer = {
  name: string;
  laps: number;
  lapTimestamps: number[];
  finished: boolean;
  finishMs: number | null;
};

const buildFromConfig = (): Swimmer[] =>
  model.swimmerNames
    .map((n) => n.trim())
    .filter((n) => n.length > 0)
    .map((name) => ({ name, laps: 0, lapTimestamps: [], finished: false, finishMs: null }));

const running = ref(false);
useWakeLock(running);
const baseStartMs = ref<number | null>(null);
const nowMs = ref(Date.now());
const tickTimer = ref<ReturnType<typeof setInterval> | null>(null);
const swimmers = ref<Swimmer[]>(buildFromConfig());
const summaryOpen = ref(false);
const flashIndex = ref<number | null>(null);
let flashTimer: ReturnType<typeof setTimeout> | null = null;

// Keep the (not-yet-started) grid in sync while the coach edits swimmer names in settings
watch(
  () => model.swimmerNames,
  () => {
    if (!running.value) swimmers.value = buildFromConfig();
  },
  { deep: true }
);

const intervalM = computed(() => model.poolLengthM * 2);

const canStart = computed(
  () => !running.value && model.swimmerNames.some((n) => n.trim().length > 0)
);

const hasAnyLaps = computed(() => swimmers.value.some((s) => s.laps > 0));

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

const playLapBeep = () => playFlatBeep(900, 0.08, 0.25);
const playFinishTone = () => playFlatBeep(500, 0.25, 0.3);

const formatMMSS = (secTotal: number) => {
  const sec = Math.max(0, Math.floor(secTotal));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const distanceM = (s: Swimmer) => s.laps * intervalM.value;
const remainingM = (s: Swimmer) => Math.max(0, TARGET_DISTANCE_M - distanceM(s));
const remainingLaps = (s: Swimmer) => Math.ceil(remainingM(s) / intervalM.value);

const elapsedMs = (s: Swimmer) => {
  if (baseStartMs.value == null) return 0;
  if (s.finished && s.finishMs != null) return s.finishMs - baseStartMs.value;
  // nowMs simply stops updating once the tick interval is cleared, so this
  // naturally freezes at the moment Stop was pressed.
  return Math.max(0, nowMs.value - baseStartMs.value);
};

// Time between a swimmer's lap at lapIdx and the one before it (or race start)
const splitAt = (s: Swimmer, lapIdx: number) => {
  const ts = s.lapTimestamps[lapIdx]!;
  const prev = lapIdx > 0 ? s.lapTimestamps[lapIdx - 1]! : (baseStartMs.value ?? ts);
  return ts - prev;
};

const lastSplitMs = (s: Swimmer) =>
  s.lapTimestamps.length === 0 ? null : splitAt(s, s.lapTimestamps.length - 1);

const start = () => {
  if (running.value) return;
  initAudio(); // must happen inside user gesture for iOS

  // Start always starts over, using the swimmer names currently configured
  swimmers.value = buildFromConfig();
  if (swimmers.value.length === 0) return;

  baseStartMs.value = Date.now();
  running.value = true;
  nowMs.value = Date.now();
  tickTimer.value = setInterval(() => { nowMs.value = Date.now(); }, 100);
};

const stop = () => {
  if (!running.value) return;
  running.value = false;
  if (tickTimer.value) {
    clearInterval(tickTimer.value);
    tickTimer.value = null;
  }
};

// Stop button doubles as Reset once the clock is already stopped
const canReset = computed(() => !running.value && baseStartMs.value != null);
const stopBtnLabel = computed(() => (running.value ? 'Stop' : 'Reset'));
const stopBtnIcon = computed(() => (running.value ? 'stop' : 'restart_alt'));
const stopBtnDisabled = computed(() => !running.value && !canReset.value);

const onStopClick = () => {
  if (running.value) {
    stop();
    return;
  }
  swimmers.value = buildFromConfig();
  baseStartMs.value = null;
};

const recordLap = (i: number) => {
  if (!running.value) return;
  const s = swimmers.value[i];
  if (!s || s.finished) return;

  const t = Date.now();
  s.lapTimestamps.push(t);
  s.laps += 1;

  flashIndex.value = i;
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    if (flashIndex.value === i) flashIndex.value = null;
  }, 200);

  if (distanceM(s) >= TARGET_DISTANCE_M) {
    s.finished = true;
    s.finishMs = t;
    playFinishTone();
  } else {
    playLapBeep();
  }
};

const undoLap = (i: number) => {
  const s = swimmers.value[i];
  if (!s || s.laps === 0) return;
  s.lapTimestamps.pop();
  s.laps -= 1;
  if (s.finished) {
    s.finished = false;
    s.finishMs = null;
  }
};

// ─── Tap vs long-press (undo) detection ──────────────────────────────────────
const LONG_PRESS_MS = 550;
const pressTimers = new Map<number, ReturnType<typeof setTimeout>>();
const longPressFired = new Map<number, boolean>();

const onPointerDown = (i: number) => {
  longPressFired.set(i, false);
  const timer = setTimeout(() => {
    longPressFired.set(i, true);
    undoLap(i);
  }, LONG_PRESS_MS);
  pressTimers.set(i, timer);
};

const clearPressTimer = (i: number) => {
  const timer = pressTimers.get(i);
  if (timer) {
    clearTimeout(timer);
    pressTimers.delete(i);
  }
};

const onPointerUp = (i: number) => {
  clearPressTimer(i);
  if (!longPressFired.get(i)) {
    recordLap(i);
  }
};

const onPointerCancel = (i: number) => {
  clearPressTimer(i);
};

onBeforeUnmount(() => {
  stop();
  pressTimers.forEach((timer) => clearTimeout(timer));
  pressTimers.clear();
  if (flashTimer) clearTimeout(flashTimer);
  void audioCtx?.close();
  audioCtx = null;
});
</script>

<style scoped lang="scss">
.test2000-page {
  height: 100%;
}

.controls-row {
  flex-shrink: 0;
}

.controls-buttons {
  flex-wrap: wrap;
}

.swimmer-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 1fr;
  gap: 8px;
  min-height: 0;
  overflow: hidden;

  @media (orientation: landscape) and (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.swimmer-card {
  min-height: 0;
  height: 100%;
  border: 1px solid grey;
  border-radius: 4px;
  user-select: none;
  touch-action: manipulation;
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.swimmer-card.swimmer-flash {
  background-color: rgba(25, 118, 210, 0.18);
}

.swimmer-card.swimmer-finished {
  background-color: rgba(76, 175, 80, 0.12);
  border-color: #4caf50;
}

.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 8px 12px;
  box-sizing: border-box;
}

.card-top {
  flex-shrink: 0;
  margin-bottom: 4px;
}

.swimmer-name {
  font-size: clamp(15px, 2.6vmin, 22px);
  font-weight: 600;
}

.lap-count {
  font-size: clamp(11px, 1.8vmin, 16px);
}

.timer-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

.timer-value {
  font-size: clamp(32px, 8vmin, 64px);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
}

.distance-row {
  flex-shrink: 0;
  font-size: clamp(13px, 2.2vmin, 18px);
  text-align: center;
}

.split-row {
  flex-shrink: 0;
  font-size: clamp(11px, 1.8vmin, 15px);
  text-align: center;
  min-height: 1.3em;
  margin-top: 2px;
}

.summary-card {
  min-width: 320px;
  max-width: 90vw;
  width: 600px;
}

.summary-scroll {
  max-height: 65vh;
  overflow-y: auto;
}
</style>
