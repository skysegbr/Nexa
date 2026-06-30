import { createContext, useEffect, useMemo, useState } from "/dist/nexa.js";

const PRODUCTS_URL = "https://fakestoreapi.com/products";

export const CatalogContext = createContext({
  products: [],
  categories: ["all"],
  loading: true,
  error: null,
  category: "all",
  setCategory: () => {},
  query: "",
  setQuery: () => {},
});

// Domain state hook — owns the catalog's data fetching and filtering.
// Lives next to CatalogContext so the two are always imported together.
// See docs/AI_SPEC.md §11 "Domain-owned context".
export function useCatalogState() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(PRODUCTS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => setAllProducts(data))
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(allProducts.map((p) => p.category))],
    [allProducts],
  );

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesQuery = !q || p.title.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [allProducts, category, query]);

  return { products, categories, loading, error, category, setCategory, query, setQuery };
}
