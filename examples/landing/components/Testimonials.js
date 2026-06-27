import { h, useState, useEffect } from "/dist/nexa.js";

const ROTATE_MS = 6000;

export function Testimonials({ testimonials }) {
  const [index, setIndex] = useState(0);

  // Auto-rotate, but always clear the previous timer first — useEffect's
  // cleanup runs before the next effect (and on unmount), so this never
  // stacks up multiple intervals as `testimonials.length` stays constant.
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, ROTATE_MS);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  function show(nextIndex) {
    setIndex((nextIndex + testimonials.length) % testimonials.length);
  }

  const active = testimonials[index];

  return h(
    "section",
    { className: "l-section l-testimonials", id: "testimonials" },
    h(
      "div",
      { className: "l-section-inner" },
      h("p", { className: "l-eyebrow l-eyebrow-center" }, "THOSE WHO USE IT, RECOMMEND IT"),
      h("h2", { className: "l-section-title" }, "Teams that traded guesswork for clarity"),
      h(
        "figure",
        { className: "l-testimonial-card" },
        h("blockquote", { className: "l-testimonial-quote" }, `“${active.quote}”`),
        h(
          "figcaption",
          { className: "l-testimonial-author" },
          h("span", { className: "l-testimonial-avatar", "aria-hidden": "true" }, active.initials),
          h("span", { className: "l-testimonial-who" },
            h("strong", null, active.name),
            h("span", null, active.role),
          ),
        ),
      ),
      h(
        "div",
        { className: "l-testimonial-controls" },
        h("button", { type: "button", className: "l-carousel-btn", "aria-label": "Previous testimonial", onClick: () => show(index - 1) }, "‹"),
        h(
          "div",
          { className: "l-testimonial-dots" },
          testimonials.map((testimonial, dotIndex) =>
            h("button", {
              key: testimonial.id,
              type: "button",
              className: dotIndex === index ? "l-testimonial-dot is-active" : "l-testimonial-dot",
              "aria-label": `View testimonial from ${testimonial.name}`,
              onClick: () => show(dotIndex),
            }),
          ),
        ),
        h("button", { type: "button", className: "l-carousel-btn", "aria-label": "Next testimonial", onClick: () => show(index + 1) }, "›"),
      ),
    ),
  );
}
