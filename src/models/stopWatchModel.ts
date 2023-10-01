import { reactive } from 'vue';
import { LocalStorage } from 'quasar';

export const NUMBER_OF_LANES_STORAGE_KEY = 'numberOfLanes';
export const TIME_IN_SEC_BETWEEN_SWIMMER_STORAGE_KEY =
  'timeInSecBetweenSwimmer';

class StopWatchModel {
  numberOfLanes = 5;
  timeInSecBetweenSwimmer = 10;

  constructor() {
    const storedNumberOfLanes = LocalStorage.getItem(
      NUMBER_OF_LANES_STORAGE_KEY
    );
    const storedTimeInSecBetweenSwimmer = LocalStorage.getItem(
      TIME_IN_SEC_BETWEEN_SWIMMER_STORAGE_KEY
    );

    if (storedNumberOfLanes) {
      this.numberOfLanes = Number(storedNumberOfLanes);
    }

    if (storedTimeInSecBetweenSwimmer) {
      this.timeInSecBetweenSwimmer = Number(storedTimeInSecBetweenSwimmer);
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
