import { h, useContext, useState, useToast } from "/dist/nexa.js";
import { ToastStack } from "/dist/nexa-components-overlay.js";
import { ThemeToggle } from "/dist/nexa-components-theme.js";
import { CatalogFilters } from "./catalog/CatalogFilters.js";
import { ProductGrid } from "./catalog/ProductGrid.js";
import { CartContext } from "./cart/CartContext.js";
import { CartButton } from "./cart/CartButton.js";
import { CartDrawer } from "./cart/CartDrawer.js";
import { AuthContext } from "./auth/AuthContext.js";
import { AuthMenu } from "./auth/AuthMenu.js";
import { LoginDialog } from "./auth/LoginDialog.js";

// Shell is the integration layer: the one place allowed to read more than
// one domain's context at once, so it's the only place that wires them
// together (cart needs to know whether auth is signed in to check out).
// CatalogFilters/ProductGrid consume CatalogContext themselves below —
// Shell only needs to bridge cart + auth for the checkout interaction.
export function Shell() {
  const cart = useContext(CartContext);
  const auth = useContext(AuthContext);

  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { toasts, toast } = useToast();

  function handleCheckout() {
    if (!auth.user) {
      setCartOpen(false);
      setLoginOpen(true);
      return;
    }
    cart.clear();
    setCartOpen(false);
    toast.success(`Order placed for ${auth.user.name}!`);
  }

  return h(
    "div",
    { className: "sf-app" },
    h(
      "header",
      { className: "sf-topbar" },
      h("span", { className: "sf-brand" }, h("i", { className: "bi-bag" }), "Nexa Shop"),
      h(
        "div",
        { className: "sf-topbar-actions" },
        h(AuthMenu, { onSignIn: () => setLoginOpen(true) }),
        h(ThemeToggle, null),
        h(CartButton, { onClick: () => setCartOpen(true) }),
      ),
    ),
    h(
      "main",
      { className: "m-container m-content m-stack" },
      h(CatalogFilters, null),
      h(ProductGrid, { onAddToCart: cart.addItem }),
    ),
    h(CartDrawer, { open: cartOpen, onClose: () => setCartOpen(false), onCheckout: handleCheckout }),
    h(LoginDialog, {
      open: loginOpen,
      onClose: () => setLoginOpen(false),
      onLogin: (name) => { auth.login(name); setLoginOpen(false); },
    }),
    h(ToastStack, { toasts, onClose: (id) => toast.dismiss(id) }),
  );
}
