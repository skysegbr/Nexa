// Todos os dados estáticos do app — exportações UPPER_CASE conforme §12 da AI_SPEC

export const CATS = [
  { value: "todos",          label: "🍽️ Todos" },
  { value: "lanche",         label: "🍔 Lanches" },
  { value: "acompanhamento", label: "🍟 Acompanhamentos" },
  { value: "bebida",         label: "🥤 Bebidas" },
  { value: "sobremesa",      label: "🍩 Sobremesas" },
];

export const CAT_OPTIONS = CATS.filter((c) => c.value !== "todos").map((c) => ({
  value: c.value,
  label: c.label,
}));

export const STATUS_LABELS = {
  recebido:  "Recebido",
  preparo:   "Em Preparo",
  pronto:    "Pronto! 🎉",
  entregue:  "Entregue",
  cancelado: "Cancelado",
};

export const PROX_STATUS = {
  recebido: "preparo",
  preparo:  "pronto",
  pronto:   "entregue",
};

export const EMPTY_PRODUTO = {
  nome: "", descricao: "", preco: "",
  categoria: "lanche", imagem_url: "", ativo: true,
};
