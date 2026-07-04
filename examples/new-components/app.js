import { h, render, useToast, useRouter } from "/dist/nexa.js";
import { Navbar, ThemeToggle, PaletteSwitcher, DesignSwitcher, ToastStack } from "/dist/nexa-components.js";

import { PageSwitches }    from "./components/switches/PageSwitches.js";
import { PageCombobox }    from "./components/PageCombobox.js";
import { PageContextMenu } from "./components/PageContextMenu.js";
import { PageFileDrop }    from "./components/PageFileDrop.js";
import { PageCodeEditor }  from "./components/PageCodeEditor.js";
import { PageToasts }      from "./components/PageToasts.js";
import { PageNewUI }       from "./components/new-ui/PageNewUI.js";
import { PageCards }       from "./components/cards/PageCards.js";
import { PageAccordion }   from "./components/accordion/PageAccordion.js";

function App() {
  const { path, navigate } = useRouter();
  const { toasts, toast }  = useToast();

  return h(
    "div",
    { className: "m-app" },

    h(Navbar, {
      brand: h("span", { style: { fontWeight: 900, fontSize: "1.1rem" } }, "⬡ Nexa Demo"),
      items: [
        { icon: h("i", { className: "bi bi-toggle-on"    }), label: "Switch & Collapse", href: "#/switches",  active: path === "/switches" || path === "/" },
        { icon: h("i", { className: "bi bi-menu-button"  }), label: "Combobox",          href: "#/combobox",  active: path === "/combobox" },
        { icon: h("i", { className: "bi bi-list-ul"      }), label: "Context Menu",      href: "#/context",   active: path === "/context"  },
        { icon: h("i", { className: "bi bi-cloud-upload" }), label: "File Drop",         href: "#/filedrop",  active: path === "/filedrop" },
        { icon: h("i", { className: "bi bi-code-slash"   }), label: "Code Editor",       href: "#/editor",    active: path === "/editor"   },
        { icon: h("i", { className: "bi bi-bell"         }), label: "Toasts & Dialog",   href: "#/toasts",    active: path === "/toasts"   },
        { icon: h("i", { className: "bi bi-stars"        }), label: "New UI",             href: "#/newui",     active: path === "/newui"    },
        { icon: h("i", { className: "bi bi-postcard"     }), label: "Cards",              href: "#/cards",     active: path === "/cards"    },
        { icon: h("i", { className: "bi bi-chevron-expand" }), label: "Accordion",        href: "#/accordion", active: path === "/accordion" },
      ],
      actions: [
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
  return h(PageSwitches);
}

render(App, document.getElementById("app"));
