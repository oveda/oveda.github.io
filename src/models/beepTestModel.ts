import { reactive } from 'vue';
import { LocalStorage } from 'quasar';

export const BEEP_TARGET_TIME_SEC_STORAGE_KEY = 'beepTargetTimeSec';
export const BEEP_DECREMENT_PER_ROUND_SEC_STORAGE_KEY = 'beepDecrementPerRoundSec';
export const BEEP_HEATS_PER_ROUND_STORAGE_KEY = 'beepHeatsPerRound';
export const BEEP_HEAT_DELAY_SEC_STORAGE_KEY = 'beepHeatDelaySec';
export const BEEP_SOUND_STYLE_STORAGE_KEY = 'beepSoundStyle';

export type SoundStyle = 'chirp' | 'beep';

class BeepTestModel {
  targetTimeSec = 60;
  decrementPerRoundSec = 1;
  heatsPerRound = 3;
  heatDelaySec = 10;
  soundStyle: SoundStyle = 'chirp';

  constructor() {
    const targetTimeSec = LocalStorage.getItem(BEEP_TARGET_TIME_SEC_STORAGE_KEY);
    const decrementPerRoundSec = LocalStorage.getItem(BEEP_DECREMENT_PER_ROUND_SEC_STORAGE_KEY);
    const heatsPerRound = LocalStorage.getItem(BEEP_HEATS_PER_ROUND_STORAGE_KEY);
    const heatDelaySec = LocalStorage.getItem(BEEP_HEAT_DELAY_SEC_STORAGE_KEY);
    const soundStyle = LocalStorage.getItem(BEEP_SOUND_STYLE_STORAGE_KEY);

    if (targetTimeSec != null) this.targetTimeSec = Number(targetTimeSec);
    if (decrementPerRoundSec != null) this.decrementPerRoundSec = Number(decrementPerRoundSec);
    if (heatsPerRound != null) this.heatsPerRound = Number(heatsPerRound);
    if (heatDelaySec != null) this.heatDelaySec = Number(heatDelaySec);
    if (soundStyle === 'beep' || soundStyle === 'chirp') this.soundStyle = soundStyle;
  }
}

let model: BeepTestModel | null = null;

export const useBeepTestModel = () => {
  if (!model) {
    model = reactive(new BeepTestModel());
  }
  return model;
};
