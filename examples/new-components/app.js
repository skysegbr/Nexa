import { h, render, useToast, useRouter } from "/dist/nexa.js";
import { Navbar, ThemeToggle, PaletteSwitcher, DesignSwitcher, ToastStack, Menu, Button } from "/dist/nexa-components.js";

import { PageSwitches }    from "./components/switches/PageSwitches.js";
import { PageCombobox }    from "./components/PageCombobox.js";
import { PageContextMenu } from "./components/PageContextMenu.js";
import { PageFileDrop }    from "./components/PageFileDrop.js";
import { PageCodeEditor }  from "./components/PageCodeEditor.js";
import { PageToasts }      from "./components/PageToasts.js";
import { PageNewUI }       from "./components/new-ui/PageNewUI.js";
import { PageCards }       from "./components/cards/PageCards.js";
import { PageAccordion }   from "./components/accordion/PageAccordion.js";
import { PageSlider }      from "./components/PageSlider.js";
import { PageMenu }        from "./components/PageMenu.js";
import { PageDataTable }   from "./components/PageDataTable.js";
import { PageDatePicker }  from "./components/PageDatePicker.js";

const MORE_PAGES = [
  { key: "context",    label: "Context Menu",         path: "/context" },
  { key: "filedrop",   label: "File Drop",            path: "/filedrop" },
  { key: "editor",     label: "Code Editor",          path: "/editor" },
  { key: "toasts",     label: "Toasts & Dialog",      path: "/toasts" },
  { key: "accordion",  label: "Accordion",            path: "/accordion" },
  { key: "slider",     label: "Slider / RangeSlider", path: "/slider" },
  { key: "menu",       label: "Menu",                 path: "/menu" },
  { key: "datatable",  label: "DataTable",            path: "/datatable" },
  { key: "datepicker", label: "DatePicker",           path: "/datepicker" },
];

function App() {
  const { path, navigate } = useRouter();
  const { toasts, toast }  = useToast();
  const isMorePageActive = MORE_PAGES.some((p) => p.path === path);

  return h(
    "div",
    { className: "m-app" },

    h(Navbar, {
      brand: h("span", { style: { fontWeight: 900, fontSize: "1.1rem" } }, "⬡ Nexa Demo"),
      items: [
        { icon: h("i", { className: "bi bi-toggle-on" }), label: "Switch & Collapse", href: "#/switches", active: path === "/switches" || path === "/" },
        { icon: h("i", { className: "bi bi-menu-button" }), label: "Combobox",        href: "#/combobox", active: path === "/combobox" },
        { icon: h("i", { className: "bi bi-stars" }),     label: "New UI",             href: "#/newui",    active: path === "/newui" },
        { icon: h("i", { className: "bi bi-postcard" }),  label: "Cards",              href: "#/cards",    active: path === "/cards" },
      ],
      actions: [
        h(Menu, {
          key: "more",
          trigger: h(Button, { variant: isMorePageActive ? "tonal" : "text" }, "More ▾"),
          align: "right",
          items: MORE_PAGES.map((p) => ({ key: p.key, label: p.label, onClick: () => navigate(p.path) })),
        }),
        h(DesignSwitcher, { key: "design" }),
        h(PaletteSwitcher, { key: "palette" }),
        h(ThemeToggle, { key: "theme" }),
      ],
    }),

    h(
      "main",
      { className: "m-container m-py-6" },
      renderPage(path, toast),
    ),

    h(ToastStack, { toasts, onClose: (id) => toast.dismiss(id) }),
  );
}

function renderPage(path, toast) {
  if (path === "/combobox")  return h(PageCombobox);
  if (path === "/context")   return h(PageContextMenu);
  if (path === "/filedrop")  return h(PageFileDrop,   { toast });
  if (path === "/editor")    return h(PageCodeEditor);
  if (path === "/toasts")    return h(PageToasts,     { toast });
  if (path === "/newui")     return h(PageNewUI);
  if (path === "/cards")     return h(PageCards);
  if (path === "/accordion") return h(PageAccordion);
  if (path === "/slider")     return h(PageSlider);
  if (path === "/menu")       return h(PageMenu,       { toast });
  if (path === "/datatable")  return h(PageDataTable);
  if (path === "/datepicker") return h(PageDatePicker);
  return h(PageSwitches);
}

render(App, document.getElementById("app"));
