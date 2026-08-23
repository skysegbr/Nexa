import { h } from "/dist/fluxaway.js";

export function PhotoPlate({ src, className = "", imageRef, alt = "" }) {
  return h(
    "figure",
    {
      className: `vp-photo-plate${className ? ` ${className}` : ""}`,
      ref: imageRef,
      ariaHidden: alt ? undefined : "true",
    },
    h("img", {
      src,
      alt,
      loading: "eager",
      decoding: "async",
      draggable: false,
    }),
  );
}
