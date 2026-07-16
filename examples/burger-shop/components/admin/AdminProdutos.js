import {
  h, useState, useContext, useForm, useFetch,
} from "/dist/nexa.js";
import { Button, Alert, Spinner } from "/dist/nexa-components-core.js";
import { TextField, Textarea, Select } from "/dist/nexa-components-forms.js";
import { Dialog } from "/dist/nexa-components-overlay.js";
import { ToastCtx } from "../ToastCtx.js";
import { api } from "../../api.js";
import { CAT_OPTIONS, EMPTY_PRODUTO } from "../../data.js";

export function AdminProdutos() {
  const toast = useContext(ToastCtx);

  const { data: produtos = [], loading, refetch } = useFetch("/api/produtos/?apenas_ativos=false");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [imgFile,    setImgFile]    = useState(null);

  const form = useForm({
    initialValues: EMPTY_PRODUTO,
    validate: (v) => ({
      nome:  !v.nome.trim()                         ? "Nome obrigatório." : "",
      preco: (!v.preco || parseFloat(v.preco) <= 0) ? "Preço inválido."   : "",
    }),
    onSubmit: async (vals, helpers) => {
      try {
        const payload = { ...vals, preco: parseFloat(vals.preco), ativo: Boolean(vals.ativo) };
        let saved = editando
          ? await api.patch(`/produtos/${editando.id}`, payload)
          : await api.post("/produtos/", payload);
        if (imgFile) saved = await api.uploadImg(saved.id, imgFile);
        toast.success(editando ? "Produto atualizado!" : "Produto criado!");
        setDialogOpen(false);
        helpers.reset();
        refetch();
      } catch (e) {
        toast.error(e.message);
      }
    },
  });

  function abrirNovo() {
    form.reset(EMPTY_PRODUTO);
    setEditando(null);
    setImgFile(null);
    setDialogOpen(true);
  }

  function abrirEditar(p) {
    form.reset({
      nome:       p.nome,
      descricao:  p.descricao,
      preco:      String(p.preco),
      categoria:  p.categoria,
      imagem_url: p.imagem_url,
      ativo:      p.ativo,
    });
    setEditando(p);
    setImgFile(null);
    setDialogOpen(true);
  }

  async function deletar(id) {
    try {
      await api.del(`/produtos/${id}`);
      toast.info("Produto removido.");
      setConfirmDel(null);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return h("div", { style: { marginTop: "1rem" } },
    h("div", { style: { marginBottom: "1rem" } },
      h(Button, { variant: "contained", onClick: abrirNovo }, "+ Novo Produto"),
    ),

    loading
      ? h(Spinner, { label: "Carregando produtos…" })
      : h("div", { style: { overflowX: "auto" } },
          h("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" } },
            h("thead", null,
              h("tr", { style: { background: "#fff3f0", textAlign: "left" } },
                ["Foto", "Nome", "Categoria", "Preço", "Ativo", "Ações"].map((col) =>
                  h("th", { key: col, style: { padding: "0.6rem 0.75rem" } }, col)
                )
              )
            ),
            h("tbody", null,
              produtos.map((p) =>
                h("tr", { key: p.id, style: { borderBottom: "1px solid #f0ede9" } },
                  h("td", { style: { padding: "0.6rem 0.75rem" } },
                    h("img", {
                      src:       p.imagem_url || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&q=60",
                      className: "admin-table-img",
                      alt:       p.nome,
                    }),
                  ),
                  h("td", { style: { padding: "0.6rem 0.75rem", fontWeight: 600 } }, p.nome),
                  h("td", { style: { padding: "0.6rem 0.75rem" } }, p.categoria),
                  h("td", { style: { padding: "0.6rem 0.75rem" } },
                    p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  ),
                  h("td", { style: { padding: "0.6rem 0.75rem" } }, p.ativo ? "✅" : "❌"),
                  h("td", { style: { padding: "0.6rem 0.75rem" } },
                    h("div", { style: { display: "flex", gap: "0.5rem" } },
                      h(Button, { variant: "tonal",  onClick: () => abrirEditar(p) }, "Editar"),
                      h(Button, { variant: "danger", onClick: () => setConfirmDel(p) }, "Excluir"),
                    ),
                  ),
                )
              )
            ),
          )
        ),

    // ── Dialog criar / editar ──
    h(Dialog, {
      open:    dialogOpen,
      onClose: () => setDialogOpen(false),
      title:   editando ? "Editar Produto" : "Novo Produto",
      actions: h("div", { style: { display: "flex", gap: "0.5rem" } },
        h(Button, { variant: "tonal",     onClick: () => setDialogOpen(false) }, "Cancelar"),
        h(Button, {
          variant:  "contained",
          onClick:  form.handleSubmit(),
          disabled: form.isSubmitting,
        }, form.isSubmitting ? "Salvando…" : "Salvar"),
      ),
    },
      h("div", { style: { display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "340px" } },
        h(TextField, { label: "Nome",       ...form.field("nome"),                           required: true }),
        h(Textarea,  { label: "Descrição",  ...form.field("descricao",  { type: "textarea" }), rows: 2 }),
        h(TextField, { label: "Preço (R$)", ...form.field("preco"),     type: "number",      required: true }),
        h(Select, {
          label:   "Categoria",
          options: CAT_OPTIONS,
          ...form.field("categoria", { type: "select" }),
        }),
        h(TextField, { label: "URL da Imagem (ou faça upload)", ...form.field("imagem_url") }),

        form.values.imagem_url && h("img", {
          src:   form.values.imagem_url,
          alt:   "preview",
          style: { width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px" },
        }),

        h("div", null,
          h("label", { style: { fontSize: "0.85rem", color: "#555", display: "block", marginBottom: "0.3rem" } },
            "Upload de Imagem"
          ),
          h("input", {
            type:     "file",
            accept:   "image/*",
            onChange: (e) => setImgFile(e.target.files?.[0] ?? null),
          }),
          imgFile && h("p", { style: { fontSize: "0.8rem", color: "#666", margin: "0.25rem 0 0" } },
            `Arquivo: ${imgFile.name}`
          ),
        ),

        h("label", { style: { display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" } },
          h("input", { ...form.field("ativo", { type: "checkbox" }) }),
          "Produto ativo (visível no cardápio)",
        ),

        (form.errors.nome || form.errors.preco) &&
          h(Alert, { variant: "danger" }, form.errors.nome || form.errors.preco),
      ),
    ),

    // ── Dialog confirmar exclusão ──
    confirmDel && h(Dialog, {
      open:    true,
      onClose: () => setConfirmDel(null),
      title:   "Excluir produto?",
      actions: h("div", { style: { display: "flex", gap: "0.5rem" } },
        h(Button, { variant: "tonal",  onClick: () => setConfirmDel(null) }, "Cancelar"),
        h(Button, { variant: "danger", onClick: () => deletar(confirmDel.id) }, "Excluir"),
      ),
    },
      h("p", null, `Tem certeza que deseja excluir "${confirmDel.nome}"? Esta ação não pode ser desfeita.`),
    ),
  );
}
