<template>
  <div class="row no-wrap absolute-full">
    <div class="column" style="gap: 10px">
      <q-btn
        v-if="numberOfStopWatches > 0"
        label="Split 1"
        color="primary"
        class="split-button"
        @click="stopWatch_1?.stopWatchRoundTime"
        :disable="!stopWatch_1?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 1"
        label="Split 2"
        color="primary"
        class="split-button"
        @click="stopWatch_2?.stopWatchRoundTime"
        :disable="!stopWatch_2?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 2"
        label="Split 3"
        color="primary"
        class="split-button"
        @click="stopWatch_3?.stopWatchRoundTime"
        :disable="!stopWatch_3?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 3"
        label="Split 4"
        color="primary"
        class="split-button"
        @click="stopWatch_4?.stopWatchRoundTime"
        :disable="!stopWatch_4?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 4"
        label="Split 5"
        color="primary"
        class="split-button"
        @click="stopWatch_5?.stopWatchRoundTime"
        :disable="!stopWatch_5?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 5"
        label="Split 6"
        color="primary"
        class="split-button"
        @click="stopWatch_6?.stopWatchRoundTime"
        :disable="!stopWatch_6?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 6"
        label="Split 7"
        color="primary"
        class="split-button"
        @click="stopWatch_7?.stopWatchRoundTime"
        :disable="!stopWatch_7?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 7"
        label="Split 8"
        color="primary"
        class="split-button"
        @click="stopWatch_8?.stopWatchRoundTime"
        :disable="!stopWatch_8?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 8"
        label="Split 9"
        color="primary"
        class="split-button"
        @click="stopWatch_9?.stopWatchRoundTime"
        :disable="!stopWatch_9?.running"
      />
      <q-btn
        v-if="numberOfStopWatches > 9"
        label="Split 10"
        color="primary"
        class="split-button"
        @click="stopWatch_10?.stopWatchRoundTime"
        :disable="!stopWatch_10?.running"
      />
    </div>

    <div class="column no-wrap justify-between">
      <div class="row justify-center" style="overflow-y: auto">
        <StopWatch
          v-if="numberOfStopWatches > 0"
          ref="stopWatch_1"
          :lane="1"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 1"
          ref="stopWatch_2"
          :lane="2"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 2"
          ref="stopWatch_3"
          :lane="3"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 3"
          ref="stopWatch_4"
          :lane="4"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 4"
          ref="stopWatch_5"
          :lane="5"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 5"
          ref="stopWatch_6"
          :lane="6"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 6"
          ref="stopWatch_7"
          :lane="7"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 7"
          ref="stopWatch_8"
          :lane="8"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 8"
          ref="stopWatch_9"
          :lane="9"
          class="q-ma-sm stop-watch"
        />
        <StopWatch
          v-if="numberOfStopWatches > 9"
          ref="stopWatch_10"
          :lane="10"
          class="q-ma-sm stop-watch"
        />
      </div>

      <div class="row no-wrap justify-center" style="height: 96px">
        <q-btn
          flat
          round
          size="32px"
          icon="play_arrow"
          aria-label="Start"
          @click="startStopWatches"
          :disable="allStarted"
        />
        <q-btn
          flat
          round
          size="32px"
          icon="stop"
          aria-label="Stop"
          @click="stopWatchesEnd"
          :disable="!allStarted"
        />
        <q-btn
          flat
          round
          size="32px"
          icon="replay"
          aria-label="Reset"
          @click="stopWatchesReset"
          :disable="allStarted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStopWatchModel } from '../models/stopWatchModel';
import StopWatch from './StopWatch.vue';

const stopWatch_1 = ref();
const stopWatch_2 = ref();
const stopWatch_3 = ref();
const stopWatch_4 = ref();
const stopWatch_5 = ref();
const stopWatch_6 = ref();
const stopWatch_7 = ref();
const stopWatch_8 = ref();
const stopWatch_9 = ref();
const stopWatch_10 = ref();

const stopWatchStartTimers = ref<NodeJS.Timeout[]>([]);

const allStarted = ref(false);

const model = computed(() => {
  return useStopWatchModel();
});

const numberOfStopWatches = computed(() => {
  return model.value.numberOfLanes;
});

const numberOfSecondsBetweenHeats = computed(() => {
  return model.value.timeInSecBetweenSwimmer;
});

const startStopWatches = () => {
  allStarted.value = true;

  if (stopWatch_1.value) {
    stopWatch_1.value.stopWatchStart();
  }
  if (stopWatch_2.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_2.value.stopWatchStart(),
        numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_3.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_3.value.stopWatchStart(),
        2 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_4.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_4.value.stopWatchStart(),
        3 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_5.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_5.value.stopWatchStart(),
        4 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_6.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_6.value.stopWatchStart(),
        5 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_7.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_7.value.stopWatchStart(),
        6 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_8.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_8.value.stopWatchStart(),
        7 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_9.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_9.value.stopWatchStart(),
        8 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
  if (stopWatch_10.value) {
    stopWatchStartTimers.value.push(
      setTimeout(
        () => stopWatch_10.value.stopWatchStart(),
        9 * numberOfSecondsBetweenHeats.value * 1000
      )
    );
  }
};

const stopWatchesEnd = () => {
  allStarted.value = false;

  clearAllStartTimers();

  stopWatch_1.value?.stopWatchEnd();
  stopWatch_2.value?.stopWatchEnd();
  stopWatch_3.value?.stopWatchEnd();
  stopWatch_4.value?.stopWatchEnd();
  stopWatch_5.value?.stopWatchEnd();
  stopWatch_6.value?.stopWatchEnd();
  stopWatch_7.value?.stopWatchEnd();
  stopWatch_8.value?.stopWatchEnd();
  stopWatch_9.value?.stopWatchEnd();
  stopWatch_10.value?.stopWatchEnd();
};

const stopWatchesReset = () => {
  stopWatchesEnd();
  stopWatch_1.value?.stopWatchReset();
  stopWatch_2.value?.stopWatchReset();
  stopWatch_3.value?.stopWatchReset();
  stopWatch_4.value?.stopWatchReset();
  stopWatch_5.value?.stopWatchReset();
  stopWatch_6.value?.stopWatchReset();
  stopWatch_7.value?.stopWatchReset();
  stopWatch_8.value?.stopWatchReset();
  stopWatch_9.value?.stopWatchReset();
  stopWatch_10.value?.stopWatchReset();
};

const clearAllStartTimers = () => {
  stopWatchStartTimers.value?.forEach((timer) => {
    timer && clearTimeout(timer);
  });
  stopWatchStartTimers.value = [];
};
</script>

<style lang="scss" scoped>
.stop-watch {
  border: 1px solid black;
  border-radius: 4px;
  padding: 4px;
}

.split-button {
  min-width: 100px;
  min-height: 60px;
  margin-top: 4px;
}
</style>
