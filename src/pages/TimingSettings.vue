<template>
  <q-card flat>
    <q-card-section>
      <q-item-label header>Timing Settings</q-item-label>
    </q-card-section>

    <q-card-section>
      <span>Numer of lanes</span>
      <q-input
        :model-value="numberOfLanes"
        @update:model-value="onNumberOfLanesUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Time between swimmer in lane (sec)</span>
      <q-input
        :model-value="timeInSecBetweenSwimmer"
        @update:model-value="onTimeIsSecBetweenSwimmerUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LocalStorage } from 'quasar';
import {
  useStopWatchModel,
  NUMBER_OF_LANES_STORAGE_KEY,
  TIME_IN_SEC_BETWEEN_SWIMMER_STORAGE_KEY,
} from '../models/stopWatchModel';

const model = computed(() => {
  return useStopWatchModel();
});

const numberOfLanes = computed(() => {
  return model.value.numberOfLanes;
});

const timeInSecBetweenSwimmer = computed(() => {
  return model.value.timeInSecBetweenSwimmer;
});

const onNumberOfLanesUpdated = (newValue: string | number | null) => {
  model.value.numberOfLanes = newValue as number;
  LocalStorage.set(NUMBER_OF_LANES_STORAGE_KEY, newValue);
};

const onTimeIsSecBetweenSwimmerUpdated = (newValue: string | number | null) => {
  model.value.timeInSecBetweenSwimmer = newValue as number;
  LocalStorage.set(TIME_IN_SEC_BETWEEN_SWIMMER_STORAGE_KEY, newValue);
};
</script>

<style lang="scss" scoped></style>
```
