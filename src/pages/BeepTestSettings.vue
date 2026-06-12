<template>
  <q-card flat>
    <q-card-section>
      <q-item-label header>Beep test settings</q-item-label>
    </q-card-section>

    <q-card-section>
      <span>Target time (sec)</span>
      <q-input
        :model-value="model.targetTimeSec"
        @update:model-value="onTargetTimeUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Subtract per round (sec)</span>
      <q-input
        :model-value="model.decrementPerRoundSec"
        @update:model-value="onDecrementUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Heats per round</span>
      <q-input
        :model-value="model.heatsPerRound"
        @update:model-value="onHeatsUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <span>Delay between heats (sec)</span>
      <q-input
        :model-value="model.heatDelaySec"
        @update:model-value="onDelayUpdated"
        dense
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <div class="q-mb-sm">Sound style</div>
      <q-btn-toggle
        :model-value="model.soundStyle"
        @update:model-value="onSoundStyleUpdated"
        :options="soundStyleOptions"
        spread
        no-caps
        unelevated
        rounded
        color="grey-3"
        text-color="dark"
        toggle-color="primary"
        toggle-text-color="white"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { LocalStorage } from 'quasar';
import {
  useBeepTestModel,
  BEEP_TARGET_TIME_SEC_STORAGE_KEY,
  BEEP_DECREMENT_PER_ROUND_SEC_STORAGE_KEY,
  BEEP_HEATS_PER_ROUND_STORAGE_KEY,
  BEEP_HEAT_DELAY_SEC_STORAGE_KEY,
  BEEP_SOUND_STYLE_STORAGE_KEY,
  type SoundStyle,
} from 'src/models/beepTestModel';

const model = useBeepTestModel();

const soundStyleOptions = [
  { label: 'Chirp', value: 'chirp' },
  { label: 'Beep', value: 'beep' },
];

const onTargetTimeUpdated = (v: string | number | null) => {
  model.targetTimeSec = Number(v);
  LocalStorage.set(BEEP_TARGET_TIME_SEC_STORAGE_KEY, v);
};

const onDecrementUpdated = (v: string | number | null) => {
  model.decrementPerRoundSec = Number(v);
  LocalStorage.set(BEEP_DECREMENT_PER_ROUND_SEC_STORAGE_KEY, v);
};

const onHeatsUpdated = (v: string | number | null) => {
  model.heatsPerRound = Number(v);
  LocalStorage.set(BEEP_HEATS_PER_ROUND_STORAGE_KEY, v);
};

const onDelayUpdated = (v: string | number | null) => {
  model.heatDelaySec = Number(v);
  LocalStorage.set(BEEP_HEAT_DELAY_SEC_STORAGE_KEY, v);
};

const onSoundStyleUpdated = (v: SoundStyle) => {
  model.soundStyle = v;
  LocalStorage.set(BEEP_SOUND_STYLE_STORAGE_KEY, v);
};
</script>
