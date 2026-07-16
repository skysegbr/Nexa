import { h, useState } from "/dist/nexa.js";
import { RadioGroup, NumberInput, TimePicker } from "/dist/nexa-components-forms.js";

export function FormControls() {
  const [frequency, setFrequency] = useState("daily");
  const [retries, setRetries] = useState(3);
  const [start, setStart] = useState("09:00");

  const summary =
    retries === null
      ? "Set the retry count to schedule."
      : `Runs ${frequency}, starting ${start ?? "—"}, up to ${retries} retr${retries === 1 ? "y" : "ies"}.`;

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "RadioGroup · NumberInput · TimePicker"),
    h(
      "div",
      { className: "demo-row", style: { alignItems: "flex-start" } },
      h(RadioGroup, {
        id: "frequency",
        label: "Frequency",
        value: frequency,
        onChange: setFrequency,
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "manual", label: "Manual only", disabled: true },
        ],
      }),
      h(NumberInput, {
        id: "retries",
        label: "Max retries",
        min: 0,
        max: 10,
        value: retries,
        onChange: setRetries,
        help: "0–10",
      }),
      h(TimePicker, {
        id: "start-time",
        label: "Start time",
        value: start,
        onChange: setStart,
        min: "06:00",
        max: "22:00",
        step: 30,
      }),
    ),
    h("p", { className: "m-text-sm m-text-muted", style: { marginTop: "var(--m-space-4)" } }, summary),
  );
}
