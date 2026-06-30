import { useEffect, useState } from "/dist/nexa.js";
import { ENFORCEMENT_URL } from "../data.js";

// openFDA's query language: AND/OR are literal tokens, joined into the URL
// with un-encoded "+" (the server treats query-string "+" as whitespace and
// then parses the resulting "AND"/bare-space tokens). Only the *values*
// inside each "field:..." clause are percent-encoded, so user input can
// never break out of its clause or get misread as an operator.
function term(field, value) {
  return `${field}:"${encodeURIComponent(value)}"`;
}

function buildSearch({ query, classification, status }) {
  const clauses = [];
  if (classification && classification !== "all") clauses.push(term("classification", classification));
  if (status && status !== "all") clauses.push(term("status", status));

  const q = query?.trim();
  if (q) {
    clauses.push(`(${[term("product_description", q), term("reason_for_recall", q), term("recalling_firm", q)].join("+")})`);
  }

  return clauses.join("+AND+");
}

// openFDA returns HTTP 404 (instead of 200 + empty array) when a search has
// zero matches — normalize that into an empty result set instead of an error.
async function fetchJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (res.status === 404) return { results: [], meta: { results: { total: 0 } } };
  if (!res.ok) throw new Error(`openFDA request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export function useDrugRecalls({ query, classification, status, limit = 25 }) {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [byClassification, setByClassification] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byState, setByState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const search = buildSearch({ query, classification, status });
    const searchParam = search ? `search=${search}&` : "";

    setLoading(true);
    setError(null);

    Promise.all([
      fetchJSON(`${ENFORCEMENT_URL}?${searchParam}sort=recall_initiation_date:desc&limit=${limit}`, controller.signal),
      fetchJSON(`${ENFORCEMENT_URL}?${searchParam}count=classification.exact`, controller.signal),
      fetchJSON(`${ENFORCEMENT_URL}?${searchParam}count=status.exact`, controller.signal),
      fetchJSON(`${ENFORCEMENT_URL}?${searchParam}count=state.exact`, controller.signal),
    ])
      .then(([list, classCounts, statusCounts, stateCounts]) => {
        setResults(list.results ?? []);
        setTotal(list.meta?.results?.total ?? 0);
        setByClassification(classCounts.results ?? []);
        setByStatus(statusCounts.results ?? []);
        setByState((stateCounts.results ?? []).slice(0, 6));
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setResults([]);
        setTotal(0);
        setByClassification([]);
        setByStatus([]);
        setByState([]);
      })
      .finally(() => {
        // A superseded request (filters changed mid-flight) still resolves
        // its .finally after the next effect run already set loading=true —
        // skip it so a stale response can't flip the spinner back off.
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query, classification, status, limit]);

  return { results, total, byClassification, byStatus, byState, loading, error };
}
