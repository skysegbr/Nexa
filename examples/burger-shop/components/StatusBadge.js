import { h } from "../../../dist/nexa.js";
import { STATUS_LABELS } from "../data.js";

// Pill de status do pedido, reutilizado por AcompanharPage e AdminPedidos —
// mesma ideia do EmptyMessage.js: um pedaço de UI usado em 2+ lugares vira
// componente próprio com CSS pareado, não uma classe solta em styles.css.
export function StatusBadge({ status }) {
  return h("span", { className: `status-pill status-${status}` },
    STATUS_LABELS[status] ?? status
  );
}
