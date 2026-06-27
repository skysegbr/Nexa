import { h, useState } from "/dist/nexa.js";

function PhotoCard({ photo, onOpen }) {
  const [loaded, setLoaded] = useState(false);

  return h(
    "figure",
    { key: photo.id, className: "g-card" },
    h(
      "button",
      {
        type: "button",
        className: "g-card-btn",
        onClick: onOpen,
        "aria-label": `Enlarge photo: ${photo.title}`,
      },
      h("img", {
        className: loaded ? "g-card-img is-loaded" : "g-card-img",
        src: photo.src,
        alt: photo.title,
        width: photo.width,
        height: photo.height,
        loading: "lazy",
        onLoad: () => setLoaded(true),
      }),
      h(
        "figcaption",
        { className: "g-card-caption" },
        h("span", { className: "g-card-title" }, photo.title),
        h("span", { className: "g-card-author" }, `Photo by ${photo.author}`),
      ),
    ),
  );
}

export function PhotoGrid({ photos, onOpen }) {
  if (photos.length === 0) {
    return h("p", { className: "g-empty" }, "No photos in this category yet.");
  }

  return h(
    "div",
    { className: "g-grid" },
    photos.map((photo, index) => h(PhotoCard, { key: photo.id, photo, onOpen: () => onOpen(index) })),
  );
}
