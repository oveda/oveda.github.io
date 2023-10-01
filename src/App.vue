<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

const $q = useQuasar();

// calling here; equivalent to when component is created
$q.dark.set(true);
</script>
