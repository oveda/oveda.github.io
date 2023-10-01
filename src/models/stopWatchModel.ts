import { reactive } from 'vue';
import { LocalStorage } from 'quasar';

export const NUMBER_OF_HEATS_STORAGE_KEY = 'numberOfHeats';
export const START_TIME_IN_SEC_STORAGE_KEY = 'startTimeInSec';
export const NUMBER_OF_RESULT_COLUMNS = 'numberOfResultColumns';
export const SHOW_SIDEBAR_SPLIT_BUTTONS = 'showSidebarSplitButtons';
export const SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS = 'showIndividualHeatButtons';
export const SHOW_THREE_COLUMNS_IN_RESULTS = 'showThreeColumnsInResult';

class StopWatchModel {
  numberOfHeats = 4;
  startTimeInSec = 10;
  numberOfResultColumns = 3;
  showSidebarSplitButtons = true;
  showIndividualHeatControlButtons = false;

  constructor() {
    const storedNumberOfHeats = LocalStorage.getItem(
      NUMBER_OF_HEATS_STORAGE_KEY
    );
    const storedStartTimeInSec = LocalStorage.getItem(
      START_TIME_IN_SEC_STORAGE_KEY
    );
    const storedNumberOfResultColumns = LocalStorage.getItem(
      NUMBER_OF_RESULT_COLUMNS
    );
    const storedShowSidebarSplitButtons = LocalStorage.getItem(
      SHOW_SIDEBAR_SPLIT_BUTTONS
    );
    const storedShowIndividualHeatButtonsControlButtons = LocalStorage.getItem(
      SHOW_INDIVIDUAL_HEAT_CONTROL_BUTTONS
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
  }
}

let model: StopWatchModel | null = null;

export const useStopWatchModel = () => {
  if (!model) {
    model = reactive(new StopWatchModel());
  }

  return model;
};
