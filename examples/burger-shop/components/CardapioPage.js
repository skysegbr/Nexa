import {
  h, Fragment, useState, useFetch,
} from "/dist/nexa.js";
import { Spinner, Alert } from "/dist/nexa-components.js";
import { CATS } from "../data.js";
import { brl } from "../api.js";
import { EmptyMessage } from "./EmptyMessage.js";

export function CardapioPage({ onAdd }) {
  const [cat, setCat] = useState("todos");

  const url = `/api/produtos/?apenas_ativos=true${cat !== "todos" ? `&categoria=${cat}` : ""}`;
  const { data: produtos = [], loading, error } = useFetch(url);

  if (loading) {
    return h("div", { style: { padding: "3rem", textAlign: "center" } },
      h(Spinner, { label: "Carregando cardápio…" })
    );
  }
  if (error) {
    return h("div", { style: { padding: "1.5rem" } },
      h(Alert, { variant: "danger" }, String(error.message ?? error))
    );
  }

  return h(Fragment, null,
    // ── filtros de categoria ──
    h("div", { className: "cat-bar" },
      CATS.map((c) =>
        h("button", {
          key: c.value,
          className: `m-chip${cat === c.value ? " m-chip-active" : ""}`,
          onClick: () => setCat(c.value),
        }, c.label)
      )
    ),

    // ── grid de produtos ──
    produtos.length === 0
      ? h(EmptyMessage, { icon: "🍽️", message: "Nenhum produto nesta categoria." })
      : h("div", { className: "produto-grid" },
          produtos.map((p) =>
            h("article", { key: p.id, className: "produto-card" },
              h("img", {
                src: p.imagem_url || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
                alt: p.nome,
                loading: "lazy",
              }),
              h("div", { className: "produto-card-body" },
                h("div", { className: "produto-nome" }, p.nome),
                h("div", { className: "produto-desc" }, p.descricao),
                h("div", { className: "produto-footer" },
                  h("span", { className: "produto-preco" }, brl(p.preco)),
                  h("button", { className: "btn-add", onClick: () => onAdd(p) }, "+ Adicionar"),
                ),
              ),
            )
          )
        ),
  );
}
