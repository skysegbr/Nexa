import {
  h, useState, useEffect, useContext, useFetch,
} from "/dist/nexa.js";
import { Button, Spinner } from "/dist/nexa-components-core.js";
import { Select } from "/dist/nexa-components-forms.js";
import { ToastCtx } from "../ToastCtx.js";
import { EmptyMessage } from "../EmptyMessage.js";
import { StatusBadge } from "../StatusBadge.js";
import { api } from "../../api.js";
import { STATUS_LABELS, PROX_STATUS } from "../../data.js";

const STATUS_OPTS = [
  { value: "todos",     label: "Todos" },
  { value: "recebido",  label: "Recebido" },
  { value: "preparo",   label: "Em Preparo" },
  { value: "pronto",    label: "Pronto" },
  { value: "entregue",  label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

export function AdminPedidos() {
  const toast = useContext(ToastCtx);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const url = `/api/pedidos/${filtroStatus !== "todos" ? `?status=${filtroStatus}` : ""}`;
  const { data: pedidos = [], loading, refetch } = useFetch(url);

  // polling a cada 15 s para novos pedidos
  useEffect(() => {
    const t = setInterval(refetch, 15_000);
    return () => clearInterval(t);
  }, [refetch]);

  async function avancarStatus(pedido) {
    const prox = PROX_STATUS[pedido.status];
    if (!prox) return;
    try {
      await api.patch(`/pedidos/${pedido.id}/status`, { status: prox });
      toast.success(`Pedido #${pedido.id} → ${STATUS_LABELS[prox]}`);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function cancelar(pedido) {
    try {
      await api.patch(`/pedidos/${pedido.id}/status`, { status: "cancelado" });
      toast.info(`Pedido #${pedido.id} cancelado.`);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return h("div", { style: { marginTop: "1rem" } },
    h("div", { style: { display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" } },
      h(Select, {
        label:    "Filtrar por status",
        value:    filtroStatus,
        onChange: (e) => setFiltroStatus(e.target.value),
        options:  STATUS_OPTS,
        style:    { minWidth: "180px" },
      }),
      h(Button, { variant: "tonal", onClick: refetch }, "🔄 Atualizar"),
    ),

    loading
      ? h(Spinner, { label: "Carregando pedidos…" })
      : pedidos.length === 0
        ? h(EmptyMessage, { icon: "📋", message: "Nenhum pedido encontrado." })
        : h("div", { style: { overflowX: "auto" } },
            h("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" } },
              h("thead", null,
                h("tr", { style: { background: "#fff3f0", textAlign: "left" } },
                  ["#", "Cliente", "Hora", "Itens", "Total", "Status", "Ações"].map((col) =>
                    h("th", { key: col, style: { padding: "0.6rem 0.75rem", whiteSpace: "nowrap" } }, col)
                  )
                )
              ),
              h("tbody", null,
                pedidos.map((r) =>
                  h("tr", { key: r.id, style: { borderBottom: "1px solid #f0ede9" } },
                    h("td", { style: { padding: "0.6rem 0.75rem", fontWeight: 700 } }, `#${r.id}`),
                    h("td", { style: { padding: "0.6rem 0.75rem" } }, r.nome_cliente),
                    h("td", { style: { padding: "0.6rem 0.75rem", whiteSpace: "nowrap" } },
                      new Date(r.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                    ),
                    h("td", { style: { padding: "0.6rem 0.75rem", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                      r.itens.map((i) => `${i.quantidade}× ${i.produto?.nome ?? "?"}`).join(", ")
                    ),
                    h("td", { style: { padding: "0.6rem 0.75rem", whiteSpace: "nowrap" } },
                      r.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    ),
                    h("td", { style: { padding: "0.6rem 0.75rem" } },
                      h(StatusBadge, { status: r.status })
                    ),
                    h("td", { style: { padding: "0.6rem 0.75rem" } },
                      h("div", { style: { display: "flex", gap: "0.4rem" } },
                        PROX_STATUS[r.status] && h(Button, {
                          variant: "contained",
                          onClick: () => avancarStatus(r),
                        }, `→ ${STATUS_LABELS[PROX_STATUS[r.status]]}`),
                        r.status !== "cancelado" && r.status !== "entregue" &&
                          h(Button, { variant: "danger", onClick: () => cancelar(r) }, "Cancelar"),
                      ),
                    ),
                  )
                )
              ),
            )
          ),
  );
}
