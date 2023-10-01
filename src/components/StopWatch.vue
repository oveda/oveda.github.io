<template>
  <div>
    <div>Lane {{ props.lane }}</div>
    <div class="full-width row justify-center text-h4">
      {{ currentStopWatchTime }}
    </div>

    <div
      v-if="stopWatchRoundTimes.length"
      style="font-weight: 500"
      class="q-pt-md"
    >
      Round times:
    </div>

    <div v-for="roundTime in stopWatchRoundTimes" :key="roundTime">
      {{ roundTime }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
interface Props {
  lane: number;
}
const props: Props = defineProps({
  lane: {
    type: Number,
    required: true,
  },
});

const stopWatchStartTime = ref<Date | null>(null);
const running = ref(false);
const timer = ref<NodeJS.Timeout | null>(null);
const currentStopWatchTime = ref<string>('00:00:00.000');
const stopWatchRoundTimes = ref<string[]>([]);

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
  currentStopWatchTime.value = '00:00:00.000';
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
  const hour = timeElapsed.getUTCHours();
  const min = timeElapsed.getUTCMinutes();
  const sec = timeElapsed.getUTCSeconds();
  const ms = timeElapsed.getUTCMilliseconds();

  currentStopWatchTime.value =
    zeroPrefix(hour, 2) +
    ':' +
    zeroPrefix(min, 2) +
    ':' +
    zeroPrefix(sec, 2) +
    '.' +
    zeroPrefix(ms, 3);
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

<style lang="scss" scoped></style>
```
