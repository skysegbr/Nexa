import { h, useState } from "/dist/nexa.js";
import { Slider, RangeSlider } from "/dist/nexa-components-forms.js";

export function PageSlider() {
  const [volume, setVolume] = useState(40);
  const [brightness, setBrightness] = useState(75);
  const [priceRange, setPriceRange] = useState([200, 800]);

  return h(
    "div",
    null,

    h("h1", { className: "m-page-title" }, "Slider / RangeSlider"),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Slider"),
      h(
        "div",
        { className: "field-demo-wrap" },
        h(Slider, {
          id: "volume",
          label: "Volume",
          min: 0,
          max: 100,
          step: 5,
          value: volume,
          showValue: true,
          onInput: (e) => setVolume(Number(e.target.value)),
        }),
      ),
    ),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "Disabled"),
      h(
        "div",
        { className: "field-demo-wrap" },
        h(Slider, {
          id: "brightness",
          label: "Brightness (disabled)",
          value: brightness,
          showValue: true,
          disabled: true,
          onInput: (e) => setBrightness(Number(e.target.value)),
        }),
      ),
    ),

    h("section", { className: "demo-section" },
      h("p", { className: "demo-label" }, "RangeSlider"),
      h(
        "div",
        { className: "field-demo-wrap" },
        h(RangeSlider, {
          id: "price",
          label: "Price range",
          min: 0,
          max: 1000,
          step: 10,
          value: priceRange,
          showValue: true,
          onChange: (next) => setPriceRange(next),
        }),
      ),
    ),
  );
}
