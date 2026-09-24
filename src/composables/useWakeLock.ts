import { onBeforeUnmount, watch, type Ref } from 'vue';

// Keeps the screen awake for as long as `active` is true. The Wake Lock API
// releases itself whenever the tab/page is hidden (e.g. phone auto-locks or
// the user briefly switches app), so we re-request it on visibilitychange.
export const useWakeLock = (active: Ref<boolean>) => {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  let sentinel: WakeLockSentinel | null = null;

  const request = async () => {
    if (!supported || sentinel) return;
    try {
      sentinel = await navigator.wakeLock!.request('screen');
      sentinel.addEventListener('release', () => {
        sentinel = null;
      });
    } catch {
      // Denied, or not allowed in this context (e.g. backgrounded) — no-op.
    }
  };

  const release = async () => {
    const s = sentinel;
    sentinel = null;
    if (s) {
      try {
        await s.release();
      } catch { /* no-op */ }
    }
  };

  const onVisibilityChange = () => {
    if (active.value && document.visibilityState === 'visible') void request();
  };

  if (supported) document.addEventListener('visibilitychange', onVisibilityChange);

  watch(active, (isActive) => {
    if (isActive) void request();
    else void release();
  }, { immediate: true });

  onBeforeUnmount(() => {
    if (supported) document.removeEventListener('visibilitychange', onVisibilityChange);
    void release();
  });
};
