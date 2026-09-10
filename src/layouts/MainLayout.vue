<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="showSettingsDrawer"
          flat
          dense
          round
          icon="arrow_back"
          aria-label="Home"
          @click="goHome"
        />

        <q-btn
          v-if="showSettingsDrawer"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> PoolCoach </q-toolbar-title>

        <div>v0.3</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered v-if="showSettingsDrawer">
      <TimingSettings v-if="settingsMode === 'stopwatch'" />
      <BeepTestSettings v-else-if="settingsMode === 'beep-test'" />
      <Test2000Settings v-else-if="settingsMode === 'test2000'" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TimingSettings from 'pages/TimingSettings.vue';
import BeepTestSettings from 'pages/BeepTestSettings.vue';
import Test2000Settings from 'pages/Test2000Settings.vue';

const leftDrawerOpen = ref(false);
const router = useRouter();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function goHome() {
  void router.push('/');
}

const route = useRoute();

const settingsMode = computed<'stopwatch' | 'beep-test' | 'test2000' | 'none'>(() => {
  const path = route.path || '';
  if (path.startsWith('/stopwatch')) return 'stopwatch';
  if (path.startsWith('/beep-test')) return 'beep-test';
  if (path.startsWith('/test2000')) return 'test2000';
  return 'none';
});

const showSettingsDrawer = computed(() => settingsMode.value !== 'none');

watch(
  () => route.path,
  () => {
    leftDrawerOpen.value = false;
  }
);
</script>
