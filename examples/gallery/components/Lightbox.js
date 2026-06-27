import { h, useEffect, useRef } from "/dist/nexa.js";

const SWIPE_THRESHOLD = 40;

export function Lightbox({ photos, index, onClose, onNavigate }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  // useSwipe registers its listener-effect from a dependency array based on
  // `ref.current` — that works for refs that stay mounted, but the lightbox's
  // own DOM node mounts/unmounts together with `index`, so the comparison
  // never observes a change at the right moment and the listeners never
  // attach. Wiring touch handling here, inside the effect already keyed on
  // `index`, guarantees `panelRef.current` is the live node when it runs.
  useEffect(() => {
    if (index === null) {
      return undefined;
    }

    const panel = panelRef.current;
    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    queueMicrotask(() => closeRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        onNavigate(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        onNavigate(1);
        return;
      }
      if (event.key === "Tab" && panel) {
        const focusable = panel.querySelectorAll("button:not([disabled]), a[href]");
        if (focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    let startX = 0;
    let startY = 0;
    const onTouchStart = (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    const onTouchEnd = (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) {
        return;
      }
      onNavigate(dx < 0 ? 1 : -1);
    };

    document.addEventListener("keydown", onKeyDown);
    panel?.addEventListener("touchstart", onTouchStart, { passive: true });
    panel?.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      panel?.removeEventListener("touchstart", onTouchStart);
      panel?.removeEventListener("touchend", onTouchEnd);
      document.body.style.overflow = previousOverflow;
      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [index, onClose, onNavigate]);

  if (index === null) {
    return null;
  }

  const photo = photos[index];

  return h(
    "div",
    {
      ref: panelRef,
      className: "g-lightbox",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": photo.title,
      tabIndex: -1,
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      },
    },
    h(
      "button",
      {
        ref: closeRef,
        type: "button",
        className: "g-lightbox-close",
        onClick: onClose,
        "aria-label": "Close",
      },
      "✕",
    ),
    photos.length > 1 &&
      h(
        "button",
        {
          type: "button",
          className: "g-lightbox-nav g-lightbox-prev",
          onClick: () => onNavigate(-1),
          "aria-label": "Previous photo",
        },
        "‹",
      ),
    h(
      "figure",
      { className: "g-lightbox-figure" },
      h("img", {
        className: "g-lightbox-img",
        src: photo.src,
        alt: photo.title,
        width: photo.width,
        height: photo.height,
      }),
      h(
        "figcaption",
        { className: "g-lightbox-info" },
        h("h2", { className: "g-lightbox-title" }, photo.title),
        h(
          "p",
          { className: "g-lightbox-meta" },
          `${photo.category} · Photo by `,
          h("a", { href: photo.sourceUrl, target: "_blank", rel: "noreferrer" }, photo.author),
          ` · ${index + 1} of ${photos.length}`,
        ),
      ),
    ),
    photos.length > 1 &&
      h(
        "button",
        {
          type: "button",
          className: "g-lightbox-nav g-lightbox-next",
          onClick: () => onNavigate(1),
          "aria-label": "Next photo",
        },
        "›",
      ),
  );
}
