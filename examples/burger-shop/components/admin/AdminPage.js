import { h, useState } from "../../../../dist/nexa.js";
import { Tabs, TabPanel } from "../../../../dist/nexa-components.js";
import { AdminProdutos } from "./AdminProdutos.js";
import { AdminPedidos }  from "./AdminPedidos.js";

export function AdminPage() {
  const [tab, setTab] = useState("produtos");

  return h("div", { className: "admin-wrap" },
    h("h2", { style: { marginBottom: "1rem" } }, "⚙️ Administração"),
    h(Tabs, {
      value:    tab,
      onChange: setTab,
      items: [
        { value: "produtos", label: "Produtos" },
        { value: "pedidos",  label: "Pedidos" },
      ],
    }),
    h(TabPanel, { id: "produtos", activeId: tab }, h(AdminProdutos, null)),
    h(TabPanel, { id: "pedidos",  activeId: tab }, h(AdminPedidos,  null)),
  );
}
