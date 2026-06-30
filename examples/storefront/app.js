import { h, render } from "/dist/nexa.js";
import { CatalogContext, useCatalogState } from "./components/catalog/CatalogContext.js";
import { CartContext, useCartState } from "./components/cart/CartContext.js";
import { AuthContext, useAuthState } from "./components/auth/AuthContext.js";
import { Shell } from "./components/Shell.js";

// app.js is the only place all three domain contexts get composed — see
// docs/AI_SPEC.md §11 "Domain-owned context". Each domain owns its own
// state hook; nesting .provide() calls here is what makes that state visible
// to h(Shell) and everything Shell renders below it.
function App() {
  const catalog = useCatalogState();
  const cart = useCartState();
  const auth = useAuthState();

  return CatalogContext.provide(catalog, () =>
    CartContext.provide(cart, () =>
      AuthContext.provide(auth, () =>
        h(Shell, null)
      )
    )
  );
}

render(App, document.getElementById("app"));
