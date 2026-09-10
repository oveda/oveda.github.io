<template>
  <q-card flat>
    <q-card-section>
      <q-item-label header>2000m test settings</q-item-label>
    </q-card-section>

    <q-card-section>
      <div class="q-mb-sm">Pool length</div>
      <q-btn-toggle
        :model-value="model.poolLengthM"
        @update:model-value="onPoolLengthUpdated"
        :options="poolLengthOptions"
        spread
        no-caps
        unelevated
        rounded
        color="grey-3"
        text-color="dark"
        toggle-color="primary"
        toggle-text-color="white"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        Button press = {{ model.poolLengthM * 2 }} m
      </div>
    </q-card-section>

    <q-card-section>
      <q-item-label header class="q-pl-none">Swimmers</q-item-label>
      <div
        v-for="(_, i) in model.swimmerNames"
        :key="i"
        class="q-mb-sm"
      >
        <q-input
          :model-value="model.swimmerNames[i]"
          @update:model-value="(v) => onSwimmerNameUpdated(i, v)"
          dense
          outlined
          :label="`Swimmer ${i + 1}`"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { LocalStorage } from 'quasar';
import {
  useTest2000Model,
  TEST2000_POOL_LENGTH_STORAGE_KEY,
  TEST2000_SWIMMER_NAMES_STORAGE_KEY,
} from 'src/models/test2000Model';

const model = useTest2000Model();

const poolLengthOptions = [
  { label: '25 m', value: 25 },
  { label: '50 m', value: 50 },
];

const onPoolLengthUpdated = (v: 25 | 50) => {
  model.poolLengthM = v;
  LocalStorage.set(TEST2000_POOL_LENGTH_STORAGE_KEY, v);
};

const onSwimmerNameUpdated = (i: number, v: string | number | null) => {
  model.swimmerNames[i] = v == null ? '' : String(v);
  LocalStorage.set(TEST2000_SWIMMER_NAMES_STORAGE_KEY, model.swimmerNames);
};
</script>
