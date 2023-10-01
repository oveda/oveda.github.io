<template>
  <q-card flat>
    <q-card-section>
      <q-item-label header>Timing Settings</q-item-label>
    </q-card-section>

    <q-card-section>
      <span>Numer of heats</span>
      <q-input
        :model-value="numberOfHeats"
        @update:model-value="onNumberOfHeatsUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Time between heats (sec)</span>
      <q-input
        :model-value="startTimeInSecBetweenHeats"
        @update:model-value="onTimeIsSecBetweenHeatsUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Number of result columns</span>
      <q-input
        :model-value="numberOfResultColumns"
        @update:model-value="onNumberOfResultColumnsUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <q-checkbox
        :model-value="showSplitButtons"
        @update:model-value="onToggleSplitButtons"
        label="Show sidebar split buttons"
      />
    </q-card-section>

    <q-card-section>
      <q-checkbox
        :model-value="showIndividualHeatControlButtons"
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
  SHOW_SIDEBAR_SPLIT_BUTTONS,
  SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS,
  NUMBER_OF_RESULT_COLUMNS,
} from '../models/stopWatchModel';

const model = computed(() => {
  return useStopWatchModel();
});

const numberOfHeats = computed(() => {
  return model.value.numberOfHeats;
});

const startTimeInSecBetweenHeats = computed(() => {
  return model.value.startTimeInSec;
});

const numberOfResultColumns = computed(() => {
  return model.value.numberOfResultColumns;
});

const showSplitButtons = computed(() => {
  return model.value.showSidebarSplitButtons;
});

const showIndividualHeatControlButtons = computed(() => {
  return model.value.showIndividualHeatControlButtons;
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
  LocalStorage.set(NUMBER_OF_RESULT_COLUMNS, newValue);
};

const onToggleSplitButtons = (newValue: boolean) => {
  console.log('onToggleSplitButtons', newValue);
  model.value.showSidebarSplitButtons = newValue;
  LocalStorage.set(SHOW_SIDEBAR_SPLIT_BUTTONS, newValue);
};

const onToggleIndividualHeatControlButtons = (newValue: boolean) => {
  console.log('onToggleIndividualHeatControlButtons', newValue);
  model.value.showIndividualHeatControlButtons = newValue;
  LocalStorage.set(SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS, newValue);
};
</script>

<style lang="scss" scoped></style>
```
