<template>
  <div>
    <div>Heat {{ props.heat }}</div>
    <div
      class="full-width row justify-center text-h5"
      @click="stopWatchRoundTime"
      style="cursor: pointer"
    >
      {{ currentStopWatchTime }}
    </div>

    <div v-if="model.showIndividualHeatControlButtons" class="row no-wrap">
      <q-btn
        flat
        round
        size="20px"
        icon="play_arrow"
        aria-label="Start"
        @click="stopWatchStart"
        :disable="running"
      />
      <q-btn
        flat
        round
        size="20px"
        icon="stop"
        aria-label="Stop"
        @click="stopWatchEnd"
        :disable="!running"
      />
      <q-btn
        flat
        round
        size="20px"
        icon="replay"
        aria-label="Reset"
        @click="stopWatchReset"
        :disable="running"
      />
    </div>

    <div
      v-if="currentRoundTimes && currentRoundTimes.length"
      style="font-weight: 500"
      class="q-pt-md"
    >
      {{ running ? 'Swimmer times' : 'Summary' }}
    </div>

    <div v-if="running || !model.autoStart" class="round-times-container">
      <div v-for="(roundTime, idx) in currentRoundTimes" :key="roundTime">
        {{ idx + 1 }} - {{ roundTime }}
      </div>
    </div>

    <div v-else>
      <div v-for="[key, value] in stopWatchRoundTimes" :key="key">
        <q-separator class="q-my-xs" />
        <span>Round {{ key + 1 }}:</span>
        <div class="round-times-container">
          <div v-for="(roundTime, idx) in value" :key="roundTime">
            {{ idx + 1 }} - {{ roundTime }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStopWatchModel } from '../models/stopWatchModel';
interface Props {
  heat: number;
}
const props: Props = defineProps({
  heat: {
    type: Number,
    required: true,
  },
});

const stopWatchStartTime = ref<Date | null>(null);
const running = ref(false);
const timer = ref<NodeJS.Timeout | null>(null);
const currentStopWatchTime = ref<string>('00:00.00');
const stopWatchRoundTimes = ref<Map<number, string[]>>(new Map());
const currentRoundIndex = ref<number>(0);

const model = computed(() => {
  return useStopWatchModel();
});

const currentRoundTimes = computed(() => {
  return stopWatchRoundTimes.value.get(currentRoundIndex.value);
});

const numberOfResultColumns = computed(() => {
  return model.value.numberOfResultColumns;
});

const stopWatchStart = () => {
  if (running.value) return;

  running.value = true;
  stopWatchStartTime.value = new Date();
  stopWatchRoundTimes.value.set(currentRoundIndex.value, []);

  timer.value = setInterval(() => calcStopWatch(), 20);
};

const stopWatchEnd = () => {
  if (!running.value) return;

  running.value = false;

  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const stopWatchReset = () => {
  if (running.value) return;

  stopWatchStartTime.value = null;
  currentStopWatchTime.value = '00:00.00';
  stopWatchRoundTimes.value.clear();
  currentRoundIndex.value = 0;
};

const stopWatchRoundTime = () => {
  if (!running.value) return;

  const currentRoundStopTimes = stopWatchRoundTimes.value.get(
    currentRoundIndex.value
  );
  currentRoundStopTimes &&
    currentRoundStopTimes.push(currentStopWatchTime.value);
};

const calcStopWatch = () => {
  if (!stopWatchStartTime.value) return;

  const currentTime = new Date();
  const timeElapsed = new Date(
    currentTime.getTime() - stopWatchStartTime.value.getTime()
  );
  const min = timeElapsed.getUTCMinutes();
  const sec = timeElapsed.getUTCSeconds();
  const ms = timeElapsed.getUTCMilliseconds();

  currentStopWatchTime.value =
    zeroPrefix(min, 2) + ':' + zeroPrefix(sec, 2) + '.' + zeroPrefix(ms, 2);

  const timeElapedInSec = timeElapsed.getTime() / 1000;
  if (
    model.value.autoStart &&
    timeElapedInSec >= model.value.autoStartIntervalInSec
  ) {
    stopWatchEnd();
    currentRoundIndex.value = currentRoundIndex.value + 1;
    stopWatchStart();
  }
};

const zeroPrefix = (num: number, digit: number) => {
  var zero = '';
  for (var i = 0; i < digit; i++) {
    zero += '0';
  }
  return (zero + num).slice(-digit);
};

defineExpose({
  stopWatchStart,
  stopWatchEnd,
  stopWatchReset,
  stopWatchRoundTime,
  running,
});
</script>

<style lang="scss" scoped>
.round-times-container {
  display: grid;
  grid-template-columns: repeat(v-bind('numberOfResultColumns'), 82px);
  grid-gap: 10px;
}
</style>
```
