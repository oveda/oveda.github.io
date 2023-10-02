<template>
  <q-card flat>
    <q-card-section>
      <q-item-label header>Timing Settings</q-item-label>
    </q-card-section>

    <q-card-section>
      <span>Numer of heats</span>
      <q-input
        :model-value="model.numberOfHeats"
        @update:model-value="onNumberOfHeatsUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Time between heats (sec)</span>
      <q-input
        :model-value="model.startTimeInSec"
        @update:model-value="onTimeIsSecBetweenHeatsUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Number of result columns</span>
      <q-input
        :model-value="model.numberOfResultColumns"
        @update:model-value="onNumberOfResultColumnsUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <q-checkbox
        :model-value="model.autoStart"
        @update:model-value="onToggleAutoStart"
        label="Autostart heats"
      />
    </q-card-section>

    <q-card-section>
      <span>Autostart interval</span>
      <q-input
        :model-value="model.autoStartIntervalInSec"
        @update:model-value="onAutoStartIntervalUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <q-checkbox
        :model-value="model.showSidebarSplitButtons"
        @update:model-value="onToggleSplitButtons"
        label="Show sidebar split buttons"
      />
    </q-card-section>

    <q-card-section>
      <q-checkbox
        :model-value="model.showIndividualHeatControlButtons"
        @update:model-value="onToggleIndividualHeatControlButtons"
        label="Show individual heat control buttons"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LocalStorage } from 'quasar';
import {
  useStopWatchModel,
  NUMBER_OF_HEATS_STORAGE_KEY,
  START_TIME_IN_SEC_STORAGE_KEY,
  SHOW_SIDEBAR_SPLIT_BUTTONS_STORAGE_KEY,
  SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS_STORAGE_KEY,
  NUMBER_OF_RESULT_COLUMNS_STORAGE_KEY,
  AUTO_START_STORAGE_KEY,
  AUTO_START_INTERVAL_IN_SEC_STORAGE_KEY,
} from '../models/stopWatchModel';

const model = computed(() => {
  return useStopWatchModel();
});

const onNumberOfHeatsUpdated = (newValue: string | number | null) => {
  model.value.numberOfHeats = newValue as number;
  LocalStorage.set(NUMBER_OF_HEATS_STORAGE_KEY, newValue);
};

const onTimeIsSecBetweenHeatsUpdated = (newValue: string | number | null) => {
  model.value.startTimeInSec = newValue as number;
  LocalStorage.set(START_TIME_IN_SEC_STORAGE_KEY, newValue);
};

const onNumberOfResultColumnsUpdated = (newValue: string | number | null) => {
  model.value.numberOfResultColumns = newValue as number;
  LocalStorage.set(NUMBER_OF_RESULT_COLUMNS_STORAGE_KEY, newValue);
};

const onToggleSplitButtons = (newValue: boolean) => {
  model.value.showSidebarSplitButtons = newValue;
  LocalStorage.set(SHOW_SIDEBAR_SPLIT_BUTTONS_STORAGE_KEY, newValue);
};

const onToggleIndividualHeatControlButtons = (newValue: boolean) => {
  model.value.showIndividualHeatControlButtons = newValue;
  LocalStorage.set(SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS_STORAGE_KEY, newValue);
};

const onToggleAutoStart = (newValue: boolean) => {
  model.value.autoStart = newValue;
  LocalStorage.set(AUTO_START_STORAGE_KEY, newValue);
};

const onAutoStartIntervalUpdated = (newValue: string | number | null) => {
  model.value.autoStartIntervalInSec = newValue as number;
  LocalStorage.set(AUTO_START_INTERVAL_IN_SEC_STORAGE_KEY, newValue);
};
</script>

<style lang="scss" scoped></style>
```
