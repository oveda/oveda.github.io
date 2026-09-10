<template>
  <q-page class="row items-center justify-center">
    <div class="column items-center q-gutter-md">
      <div class="text-h5">PoolCoach</div>
      <div class="text-subtitle2 text-grey-7">Choose a mode</div>

      <div class="row justify-center q-gutter-md">
        <q-btn
          color="primary"
          size="lg"
          icon="timer"
          label="Stopwatch"
          @click="go('/stopwatch')"
        />
        <q-btn
          color="secondary"
          size="lg"
          icon="campaign"
          label="Beep test"
          @click="go('/beep-test')"
        />
        <q-btn
          color="accent"
          size="lg"
          icon="pool"
          label="2000m test"
          @click="go('/test2000')"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const go = (path: string) => router.push(path);
</script>

