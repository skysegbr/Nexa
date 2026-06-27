import { h, render, useState, useCallback } from "/dist/nexa.js";
import { PHOTOS } from "./data.js";
import { CategoryFilter } from "./components/CategoryFilter.js";
import { PhotoGrid } from "./components/PhotoGrid.js";
import { Lightbox } from "./components/Lightbox.js";

const ALL = "All";
const CATEGORIES = [ALL, ...new Set(PHOTOS.map((photo) => photo.category))];

function App() {
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const photos =
    activeCategory === ALL ? PHOTOS : PHOTOS.filter((photo) => photo.category === activeCategory);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navigateLightbox = useCallback(
    (delta) =>
      setLightboxIndex((current) =>
        current === null ? current : (current + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  return h(
    "div",
    { className: "g-page" },
    h(
      "header",
      { className: "g-header" },
      h("p", { className: "g-eyebrow" }, "Gallery"),
      h("h1", null, "Scenes worth keeping"),
      h(
        "p",
        { className: "g-lede" },
        "Twelve free-to-use photos, organized by category — click any one to open it full screen.",
      ),
    ),
    h(CategoryFilter, { categories: CATEGORIES, active: activeCategory, onSelect: setActiveCategory }),
    h(PhotoGrid, { photos, onOpen: setLightboxIndex }),
    h(Lightbox, { photos, index: lightboxIndex, onClose: closeLightbox, onNavigate: navigateLightbox }),
  );
}

render(App, document.getElementById("app"));
