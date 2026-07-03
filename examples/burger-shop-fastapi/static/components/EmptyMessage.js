import { h } from "/dist/nexa.js";

// Estado vazio reutilizado por CardapioPage, PedidoPage e AdminPedidos —
// extraído para cá em vez de deixar `.empty` / `.empty-icon` soltos no
// styles.css central (§12 AI_SPEC — CSS reutilizado vira componente, não
// classe global).
export function EmptyMessage({ icon, message, hint }) {
  return h("div", { className: "empty" },
    h("div", { className: "empty-icon" }, icon),
    h("p", null, message),
    hint && h("p", { className: "empty-hint" }, hint),
  );
}
