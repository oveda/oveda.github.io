import { reactive } from 'vue';
import { LocalStorage } from 'quasar';

export const NUMBER_OF_HEATS_STORAGE_KEY = 'numberOfHeats';
export const START_TIME_IN_SEC_STORAGE_KEY = 'startTimeInSec';
export const NUMBER_OF_RESULT_COLUMNS_STORAGE_KEY = 'numberOfResultColumns';
export const SHOW_SIDEBAR_SPLIT_BUTTONS_STORAGE_KEY = 'showSidebarSplitButtons';
export const SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS_STORAGE_KEY =
  'showIndividualHeatButtons';
export const SHOW_THREE_COLUMNS_IN_RESULTS_STORAGE_KEY =
  'showThreeColumnsInResult';
export const AUTO_START_STORAGE_KEY = 'autoStart';
export const AUTO_START_INTERVAL_IN_SEC_STORAGE_KEY = 'autoStartIntervalInSec';

class StopWatchModel {
  numberOfHeats = 4;
  startTimeInSec = 10;
  numberOfResultColumns = 3;
  showSidebarSplitButtons = true;
  showIndividualHeatControlButtons = false;
  autoStart = false;
  autoStartIntervalInSec = 60;

  constructor() {
    const storedNumberOfHeats = LocalStorage.getItem(
      NUMBER_OF_HEATS_STORAGE_KEY
    );
    const storedStartTimeInSec = LocalStorage.getItem(
      START_TIME_IN_SEC_STORAGE_KEY
    );
    const storedNumberOfResultColumns = LocalStorage.getItem(
      NUMBER_OF_RESULT_COLUMNS_STORAGE_KEY
    );
    const storedShowSidebarSplitButtons = LocalStorage.getItem(
      SHOW_SIDEBAR_SPLIT_BUTTONS_STORAGE_KEY
    );
    const storedShowIndividualHeatButtonsControlButtons = LocalStorage.getItem(
      SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS_STORAGE_KEY
    );
    const autoStart = LocalStorage.getItem(AUTO_START_STORAGE_KEY);
    const autoStartIntervalInSec = LocalStorage.getItem(
      AUTO_START_INTERVAL_IN_SEC_STORAGE_KEY
    );

    if (storedNumberOfHeats) {
      this.numberOfHeats = Number(storedNumberOfHeats);
    }

    if (storedStartTimeInSec) {
      this.startTimeInSec = Number(storedStartTimeInSec);
    }

    if (storedNumberOfResultColumns) {
      this.numberOfResultColumns = Number(storedNumberOfResultColumns);
    }

    if (storedShowSidebarSplitButtons != null) {
      this.showSidebarSplitButtons = Boolean(storedShowSidebarSplitButtons);
    }

    if (storedShowIndividualHeatButtonsControlButtons != null) {
      this.showIndividualHeatControlButtons = Boolean(
        storedShowIndividualHeatButtonsControlButtons
      );
    }

    if (autoStart != null) {
      this.autoStart = Boolean(autoStart);
    }

    if (autoStartIntervalInSec) {
      this.autoStartIntervalInSec = Number(autoStartIntervalInSec);
    }
  }
}

let model: StopWatchModel | null = null;

export const useStopWatchModel = () => {
  if (!model) {
    model = reactive(new StopWatchModel());
  }

  return model;
};
