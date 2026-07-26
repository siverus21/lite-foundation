/**
 * Shared body scroll lock for Modal / Offcanvas.
 */
let lockCount = 0;

function restoreScrollY(scrollY) {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  // Override CSS `scroll-behavior: smooth` so unlock doesn't animate from 0 → y.
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, scrollY);
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY);
    html.style.scrollBehavior = previous;
  });
}

export function lockScroll() {
  if (lockCount === 0) {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.dataset.lfScrollY = String(scrollY);
    // Set top before position:fixed (via .is-scroll-locked), or scrollY resets to 0.
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('is-scroll-locked');
  }
  lockCount += 1;
}

export function unlockScroll() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;

  const scrollY = Number(document.body.dataset.lfScrollY || 0);
  document.body.classList.remove('is-scroll-locked', 'is-modal-open', 'is-offcanvas-open');
  document.body.style.top = '';
  delete document.body.dataset.lfScrollY;
  restoreScrollY(scrollY);
}

/** Test helper — reset ref-count and body classes. */
export function resetScrollLock() {
  lockCount = 0;
  document.body.classList.remove('is-scroll-locked', 'is-modal-open', 'is-offcanvas-open');
  document.body.style.top = '';
  delete document.body.dataset.lfScrollY;
}
