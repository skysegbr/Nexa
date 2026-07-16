import {
  h, Fragment, useState, useEffect, useFetch,
} from "/dist/nexa.js";
import { Spinner, Alert, Button } from "/dist/nexa-components-core.js";
import { TextField } from "/dist/nexa-components-forms.js";
import { STATUS_LABELS } from "../data.js";
import { brl } from "../api.js";
import { StatusBadge } from "./StatusBadge.js";

const STEPS = ["recebido", "preparo", "pronto", "entregue"];

export function AcompanharPage({ pedidoIdInicial }) {
  const [pedidoId, setPedidoId] = useState(String(pedidoIdInicial ?? ""));
  const [buscarId, setBuscarId] = useState(pedidoIdInicial ? String(pedidoIdInicial) : null);

  const { data: pedido, loading, error, refetch } = useFetch(
    buscarId ? `/api/pedidos/${buscarId}` : null
  );

  const stepIndex = pedido ? STEPS.indexOf(pedido.status) : -1;

  // sincroniza se o pai atualizar pedidoIdInicial (após criar pedido)
  useEffect(() => {
    if (pedidoIdInicial) {
      const s = String(pedidoIdInicial);
      setPedidoId(s);
      setBuscarId(s);
    }
  }, [pedidoIdInicial]);

  // polling a cada 10 s enquanto o pedido está em andamento
  useEffect(() => {
    if (!pedido || pedido.status === "entregue" || pedido.status === "cancelado") return;
    const timer = setInterval(refetch, 10_000);
    return () => clearInterval(timer);
  }, [pedido, refetch]);

  return h("div", { className: "page-wrap" },
    h("h2", { style: { marginBottom: "1rem" } }, "🔍 Acompanhar Pedido"),

    h("div", { style: { display: "flex", gap: "0.75rem", marginBottom: "1.5rem" } },
      h(TextField, {
        label:       "Número do pedido",
        value:       pedidoId,
        type:        "number",
        onInput:     (e) => setPedidoId(e.target.value),
        placeholder: "Ex: 3",
        style:       { flex: 1 },
      }),
      h(Button, {
        variant:  "contained",
        onClick:  () => setBuscarId(pedidoId),
        disabled: loading,
        style:    { alignSelf: "flex-end" },
      }, "Buscar"),
    ),

    loading && h(Spinner, { label: "Buscando pedido…" }),
    error   && h(Alert,   { variant: "danger" }, String(error.message ?? error)),

    pedido && h("div", { className: "m-card m-card-padded" },
      h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" } },
        h("strong", null, `Pedido #${pedido.id}`),
        h(StatusBadge, { status: pedido.status }),
      ),
      h("div", { style: { fontSize: "0.85rem", color: "#666", marginBottom: "0.75rem" } },
        `Cliente: ${pedido.nome_cliente}`,
        pedido.observacao ? ` · Obs: ${pedido.observacao}` : null,
      ),

      // ── barra de progresso ──
      pedido.status !== "cancelado" && h(Fragment, null,
        h("div", { style: { display: "flex", marginBottom: "0.35rem" } },
          STEPS.map((s, i) =>
            h("div", {
              key:   s,
              style: {
                flex:       1,
                textAlign:  "center",
                fontSize:   "0.72rem",
                fontWeight: i <= stepIndex ? 700 : 400,
                color:      i <= stepIndex ? "#d4400a" : "#bbb",
              },
            }, STATUS_LABELS[s])
          )
        ),
        h("div", {
          style: {
            height: "8px", background: "#f0ede9",
            borderRadius: "4px", overflow: "hidden", marginBottom: "1rem",
          },
        },
          h("div", {
            style: {
              height:       "100%",
              width:        `${Math.max(0, (stepIndex / (STEPS.length - 1)) * 100)}%`,
              background:   "linear-gradient(90deg,#d4400a,#f97316)",
              borderRadius: "4px",
              transition:   "width 0.5s",
            },
          })
        ),
      ),

      // ── itens ──
      h("div", { style: { fontSize: "0.9rem" } },
        pedido.itens.map((it) =>
          h("div", {
            key:   it.id,
            style: { display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #f5f5f5" },
          },
            h("span", null, `${it.quantidade}× ${it.produto?.nome ?? "Produto"}`),
            h("span", null, brl(it.preco_unitario * it.quantidade)),
          )
        ),
        h("div", {
          style: { display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: "0.5rem" },
        },
          h("span", null, "Total"),
          h("span", { style: { color: "#d4400a" } }, brl(pedido.total)),
        ),
      ),
    ),
  );
}
