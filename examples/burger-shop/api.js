// Utilitários de API e formatação — compartilhados entre componentes

export const api = {
  async get(path) {
    const r = await fetch(`/api${path}`);
    if (!r.ok) throw new Error((await r.json()).detail ?? r.statusText);
    return r.json();
  },
  async post(path, body) {
    const r = await fetch(`/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error((await r.json()).detail ?? r.statusText);
    return r.json();
  },
  async patch(path, body) {
    const r = await fetch(`/api${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error((await r.json()).detail ?? r.statusText);
    return r.json();
  },
  async del(path) {
    const r = await fetch(`/api${path}`, { method: "DELETE" });
    if (!r.ok) throw new Error((await r.json()).detail ?? r.statusText);
  },
  async uploadImg(produtoId, file) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch(`/api/produtos/${produtoId}/imagem`, { method: "POST", body: fd });
    if (!r.ok) throw new Error((await r.json()).detail ?? r.statusText);
    return r.json();
  },
};

export const brl = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
