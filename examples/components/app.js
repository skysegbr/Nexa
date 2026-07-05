import { h, render, useToast, useRouter } from "/dist/nexa.js";
import { Navbar, ThemeToggle, PaletteSwitcher, DesignSwitcher, ToastStack, Menu, Button } from "/dist/nexa-components.js";

import { PageSwitches }    from "./components/switches/PageSwitches.js";
import { PageCombobox }    from "./components/PageCombobox.js";
import { PageContextMenu } from "./components/PageContextMenu.js";
import { PageFileDrop }    from "./components/PageFileDrop.js";
import { PageCodeEditor }  from "./components/PageCodeEditor.js";
import { PageToasts }      from "./components/PageToasts.js";
import { PagePrimitives }  from "./components/primitives/PagePrimitives.js";
import { PageCards }       from "./components/cards/PageCards.js";
import { PageAccordion }   from "./components/accordion/PageAccordion.js";
import { PageSlider }      from "./components/PageSlider.js";
import { PageMenu }        from "./components/PageMenu.js";
import { PageDataTable }   from "./components/PageDataTable.js";
import { PageDatePicker }  from "./components/PageDatePicker.js";
import { PageWidgets }     from "./components/widgets/PageWidgets.js";

const EXAMPLE_PAGES = [
  { key: "switches",   label: "Switch & Collapse",    path: "/switches",   icon: "bi-toggle-on" },
  { key: "combobox",   label: "Combobox",              path: "/combobox",   icon: "bi-menu-button" },
  { key: "context",    label: "Context Menu",          path: "/context",    icon: "bi-list-ul" },
  { key: "filedrop",   label: "File Drop",             path: "/filedrop",   icon: "bi-cloud-upload" },
  { key: "editor",     label: "Code Editor",           path: "/editor",     icon: "bi-code-slash" },
  { key: "toasts",     label: "Toasts & Dialog",       path: "/toasts",     icon: "bi-bell" },
  { key: "primitives", label: "UI Primitives",         path: "/primitives", icon: "bi-stars" },
  { key: "cards",      label: "Cards",                 path: "/cards",      icon: "bi-postcard" },
  { key: "accordion",  label: "Accordion",             path: "/accordion",  icon: "bi-chevron-expand" },
  { key: "slider",     label: "Slider / RangeSlider",  path: "/slider",     icon: "bi-sliders" },
  { key: "menu",       label: "Menu",                  path: "/menu",       icon: "bi-list-nested" },
  { key: "datatable",  label: "DataTable",             path: "/datatable",  icon: "bi-table" },
  { key: "datepicker", label: "DatePicker",            path: "/datepicker", icon: "bi-calendar3" },
  { key: "widgets",    label: "Forms & Widgets",       path: "/widgets",    icon: "bi-magic" },
];

function App() {
  const { path, navigate } = useRouter();
  const { toasts, toast }  = useToast();
  const current = EXAMPLE_PAGES.find((p) => p.path === path) ?? EXAMPLE_PAGES[0];

  return h(
    "div",
    { className: "m-app" },

    h(Navbar, {
      brand: h("span", { style: { fontWeight: 900, fontSize: "1.1rem" } }, "⬡ Nexa Demo"),
      actions: [
        h(Menu, {
          key: "examples",
          trigger: h(Button, { variant: "tonal" }, `${current.label} ▾`),
          align: "right",
          items: EXAMPLE_PAGES.map((p) => ({
            key: p.key,
            label: p.label,
            icon: h("i", { className: `bi ${p.icon}` }),
            onClick: () => navigate(p.path),
          })),
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
  if (path === "/primitives") return h(PagePrimitives);
  if (path === "/cards")     return h(PageCards);
  if (path === "/accordion") return h(PageAccordion);
  if (path === "/slider")     return h(PageSlider);
  if (path === "/menu")       return h(PageMenu,       { toast });
  if (path === "/datatable")  return h(PageDataTable);
  if (path === "/datepicker") return h(PageDatePicker);
  if (path === "/widgets")    return h(PageWidgets,    { toast });
  return h(PageSwitches);
}

render(App, document.getElementById("app"));
