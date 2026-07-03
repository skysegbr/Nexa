import {
  h, useMemo, useContext, useForm,
} from "../../../dist/nexa.js";
import {
  Button, TextField, Textarea, Alert,
} from "../../../dist/nexa-components.js";
import { ToastCtx } from "./ToastCtx.js";
import { EmptyMessage } from "./EmptyMessage.js";
import { api, brl } from "../api.js";

export function PedidoPage({ cart, setCart, onPedidoCriado }) {
  const toast = useContext(ToastCtx);

  const total = useMemo(
    () => cart.reduce((s, it) => s + it.preco * it.qty, 0),
    [cart]
  );

  const form = useForm({
    initialValues: { nome_cliente: "", observacao: "" },
    validate: (v) => ({
      nome_cliente: !v.nome_cliente.trim() ? "Informe seu nome." : "",
    }),
    onSubmit: async (vals, helpers) => {
      try {
        const pedido = await api.post("/pedidos/", {
          nome_cliente: vals.nome_cliente.trim(),
          observacao:   vals.observacao.trim(),
          itens: cart.map((it) => ({ produto_id: it.id, quantidade: it.qty })),
        });
        setCart([]);
        helpers.reset();
        toast.success(`Pedido #${pedido.id} enviado com sucesso! 🎉`);
        onPedidoCriado(pedido.id);
      } catch (e) {
        toast.error(e.message);
      }
    },
  });

  function changeQty(prodId, delta) {
    setCart((prev) =>
      prev
        .map((it) => it.id === prodId ? { ...it, qty: it.qty + delta } : it)
        .filter((it) => it.qty > 0)
    );
  }

  if (cart.length === 0) {
    return h(EmptyMessage, {
      icon: "🛒",
      message: "Seu carrinho está vazio.",
      hint: "Vá ao cardápio e adicione itens!",
    });
  }

  return h("div", { className: "page-wrap" },
    h("h2", { style: { marginBottom: "1rem" } }, "🛒 Seu Pedido"),

    // ── itens do carrinho ──
    h("div", { className: "m-card m-card-padded", style: { marginBottom: "1.25rem" } },
      cart.map((it) =>
        h("div", { key: it.id, className: "cart-item" },
          h("img", {
            src: it.imagem_url || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
            alt: it.nome,
          }),
          h("div", { className: "cart-item-info" },
            h("div", { className: "cart-item-name" }, it.nome),
            h("div", { className: "cart-item-price" }, brl(it.preco * it.qty)),
          ),
          h("div", { className: "qty-ctrl" },
            h("button", { className: "qty-btn", onClick: () => changeQty(it.id, -1) }, "−"),
            h("span", null, it.qty),
            h("button", { className: "qty-btn", onClick: () => changeQty(it.id, 1) }, "+"),
          ),
        )
      ),
      h("hr", { className: "m-divider" }),
      h("div", { className: "cart-total" },
        h("span", null, "Total"),
        h("span", { style: { color: "#d4400a" } }, brl(total)),
      ),
    ),

    // ── dados do cliente ──
    h(TextField, { label: "Seu nome",              ...form.field("nome_cliente"),               placeholder: "Ex: João Silva", required: true }),
    h("div",     { style: { height: "0.75rem" } }),
    h(Textarea,  { label: "Observações (opcional)", ...form.field("observacao", { type: "textarea" }), rows: 3 }),

    h("div", { style: { marginTop: "1rem" } },
      h(Button, {
        variant:  "contained",
        disabled: form.isSubmitting,
        onClick:  form.handleSubmit(),
        style:    { width: "100%", justifyContent: "center" },
      }, form.isSubmitting ? "Enviando…" : "Confirmar Pedido 🚀"),
    ),
  );
}
