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
      v-if="stopWatchRoundTimes.length"
      style="font-weight: 500"
      class="q-pt-md"
    >
      Swimmer times:
    </div>

    <div class="round-times-container">
      <div v-for="(roundTime, idx) in stopWatchRoundTimes" :key="roundTime">
        {{ idx + 1 }} - {{ roundTime }}
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
const stopWatchRoundTimes = ref<string[]>([]);

const model = computed(() => {
  return useStopWatchModel();
});

const numberOfResultColumns = computed(() => {
  return model.value.numberOfResultColumns;
});

const stopWatchStart = () => {
  if (running.value) return;

  running.value = true;
  stopWatchStartTime.value = new Date();

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
  stopWatchRoundTimes.value = [];
};

const stopWatchRoundTime = () => {
  if (!running.value) return;

  stopWatchRoundTimes.value.push(currentStopWatchTime.value);
};

const calcStopWatch = () => {
  if (!stopWatchStartTime.value) return;

  const currentTime = new Date();
  const timeElapsed = new Date(
    currentTime.getTime() - stopWatchStartTime.value.getTime()
  );
  //const hour = timeElapsed.getUTCHours();
  const min = timeElapsed.getUTCMinutes();
  const sec = timeElapsed.getUTCSeconds();
  const ms = timeElapsed.getUTCMilliseconds();

  currentStopWatchTime.value =
    // zeroPrefix(hour, 2) +
    // ':' +
    zeroPrefix(min, 2) + ':' + zeroPrefix(sec, 2) + '.' + zeroPrefix(ms, 2);
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
  grid-template-columns: repeat(v-bind('numberOfResultColumns'), 1fr);
  grid-gap: 10px;
}
</style>
```
