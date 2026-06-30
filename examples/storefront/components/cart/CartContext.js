import { createContext, useCallback, useMemo, useState } from "/dist/nexa.js";

export const CartContext = createContext({
  items: [],
  itemCount: 0,
  subtotal: 0,
  addItem: () => {},
  setQty: () => {},
  removeItem: () => {},
  clear: () => {},
});

// Domain state hook — pure client-side state, no fetching. Cart never reads
// catalog or auth data directly; it only stores the product snapshot it was
// handed via addItem(product). See docs/AI_SPEC.md §11 "Domain-owned context".
export function useCartState() {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((prev) => (
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    ));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items]);

  return { items, itemCount, subtotal, addItem, setQty, removeItem, clear };
}
