import { h, useNetworkStatus, useOrientation } from "/dist/nexa.js";
import { Alert, Card } from "/dist/nexa-components-core.js";

export function ProfileScreen() {
  const online      = useNetworkStatus();
  const orientation = useOrientation();

  return h(
    "div",
    { className: "m-stack" },
    h(
      Card,
      { padded: true },
      h("strong", null, "Network status"),
      h("p", { className: "m-text-muted", style: { margin: "4px 0 0" } },
        online ? "🟢 Online" : "🔴 Offline",
      ),
    ),
    h(
      Card,
      { padded: true },
      h("strong", null, "Orientation"),
      h("p", { className: "m-text-muted", style: { margin: "4px 0 0" } },
        orientation === "landscape" ? "🔄 Landscape" : "📱 Portrait",
      ),
    ),
    h(
      Alert,
      { variant: "success", title: "Mobile hooks active" },
      "useNetworkStatus and useOrientation are working.",
    ),
  );
}
