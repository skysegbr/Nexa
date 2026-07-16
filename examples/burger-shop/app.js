// ─── app.js — orquestrador (§12 AI_SPEC) ─────────────────────────────────────
// Apenas imports, estado de nível raiz e render().
// Zero lógica de negócio ou dados embutidos aqui.

import {
  h, render, useState, useMemo, useToast,
} from "/dist/nexa.js";
import { ToastStack } from "/dist/nexa-components-overlay.js";

import { ToastCtx }       from "./components/ToastCtx.js";
import { TopBar }         from "./components/TopBar.js";
import { CardapioPage }   from "./components/CardapioPage.js";
import { PedidoPage }     from "./components/PedidoPage.js";
import { AcompanharPage } from "./components/AcompanharPage.js";
import { AdminPage }      from "./components/admin/AdminPage.js";

// ════════════════════════════════════════════════════════════════════════════
//  ROOT APP
// ════════════════════════════════════════════════════════════════════════════
function App() {
  const [page, setPage]             = useState("cardapio");
  const [cart, setCart]             = useState([]);
  const [ultimoPedidoId, setUltimoPedidoId] = useState(null);

  // useToast na raiz — único dono da fila de notificações
  const { toasts, toast } = useToast();

  const cartCount = useMemo(
    () => cart.reduce((s, it) => s + it.qty, 0),
    [cart]
  );

  function addToCart(produto) {
    setCart((prev) => {
      const ex = prev.find((it) => it.id === produto.id);
      return ex
        ? prev.map((it) => it.id === produto.id ? { ...it, qty: it.qty + 1 } : it)
        : [...prev, { ...produto, qty: 1 }];
    });
    toast.success(`${produto.nome} adicionado ao carrinho 🛒`);
  }

  function onPedidoCriado(pedidoId) {
    setUltimoPedidoId(pedidoId);
    setPage("acompanhar");
  }

  // ToastCtx.provide(value, renderFn) — padrão Nexa correto para contexto (§7).
  // Os filhos são construídos DENTRO do thunk, garantindo que já estão
  // no topo da pilha de contexto quando executam.
  return ToastCtx.provide(toast, () =>
    h("div", null,
      h(TopBar, { page, setPage, cartCount }),

      page === "cardapio"   && h(CardapioPage,   { onAdd: addToCart }),
      page === "pedido"     && h(PedidoPage,     { cart, setCart, onPedidoCriado }),
      page === "acompanhar" && h(AcompanharPage, { pedidoIdInicial: ultimoPedidoId }),
      page === "admin"      && h(AdminPage, null),

      // ToastStack renderizado uma única vez na raiz
      h(ToastStack, {
        toasts,
        onClose: (id) => toast.dismiss(id),
      }),
    )
  );
}

render(App, document.getElementById("app"));
