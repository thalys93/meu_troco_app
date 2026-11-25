export const OVERLAY_DISMISS_GUARD_MS = 400;

export function deferDropdownMenuAction(
  event: Event,
  action: () => void
) {
  event.preventDefault();
  window.setTimeout(action, 0);
}

export function createOverlayDismissGuard() {
  let guardedUntil = 0;

  return {
    mark() {
      guardedUntil = Date.now() + OVERLAY_DISMISS_GUARD_MS;
    },
    isActive() {
      return Date.now() < guardedUntil;
    },
  };
}
