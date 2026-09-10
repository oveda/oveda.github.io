import { reactive } from 'vue';
import { LocalStorage } from 'quasar';

export const TEST2000_POOL_LENGTH_STORAGE_KEY = 'test2000PoolLengthM';
export const TEST2000_SWIMMER_NAMES_STORAGE_KEY = 'test2000SwimmerNames';

export const TEST2000_SWIMMER_SLOTS = 10;

class Test2000Model {
  poolLengthM: 25 | 50 = 25;
  swimmerNames: string[] = Array.from({ length: TEST2000_SWIMMER_SLOTS }, () => '');

  constructor() {
    const poolLengthM = LocalStorage.getItem(TEST2000_POOL_LENGTH_STORAGE_KEY);
    const swimmerNames = LocalStorage.getItem(TEST2000_SWIMMER_NAMES_STORAGE_KEY);

    if (Number(poolLengthM) === 25 || Number(poolLengthM) === 50) {
      this.poolLengthM = Number(poolLengthM) as 25 | 50;
    }

    if (Array.isArray(swimmerNames)) {
      for (let i = 0; i < TEST2000_SWIMMER_SLOTS; i++) {
        const v = (swimmerNames as unknown[])[i];
        if (typeof v === 'string') this.swimmerNames[i] = v;
      }
    }
  }
}

let model: Test2000Model | null = null;

export const useTest2000Model = () => {
  if (!model) {
    model = reactive(new Test2000Model());
  }
  return model;
};
