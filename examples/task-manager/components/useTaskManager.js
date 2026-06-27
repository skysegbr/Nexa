import { useCallback, useEffect, useRef, useState } from "../../../dist/nexa.js";

const API =
  window.location.port === "5050" ? window.location.origin : "http://localhost:5050";
const PER_PAGE = 5;

/**
 * Centralized data hook for the Task Manager.
 * Returns everything App needs: data, loading state, action callbacks.
 */
export function useTaskManager() {
  // ── Remote data ───────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Filters / pagination ──────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    category: "all",
    sort: "createdAt",
  });
  const [page, setPage] = useState(1);

  const searchTimerRef = useRef(null);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(PER_PAGE),
        sort: filters.sort,
        order: "desc",
      });
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.priority !== "all") params.set("priority", filters.priority);
      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.search.trim()) params.set("search", filters.search.trim());

      const res = await fetch(`${API}/api/tasks?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(data.tasks);
      setTotalTasks(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setFetchError("Could not connect to the server. Start the backend with: python server.py");
    } finally {
      setLoadingTasks(false);
    }
  }, [filters, page]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API}/api/stats`);
      if (!res.ok) return;
      setStats(await res.json());
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/categories`);
      if (!res.ok) return;
      setCategories(await res.json());
    } catch {
      // ignore
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters, page]);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    if (key === "search") {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        setPage(1);
        setFilters((f) => ({ ...f, search: value }));
      }, 350);
      return;
    }
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  // ── Mutation helpers ──────────────────────────────────────────────────────
  const refresh = () => {
    fetchTasks();
    fetchStats();
  };

  const patchStatus = async (id, status) => {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error();
    refresh();
  };

  const deleteTask = async (id) => {
    const res = await fetch(`${API}/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    refresh();
  };

  return {
    // data
    tasks, totalTasks, totalPages, stats, categories,
    loadingTasks, loadingStats, fetchError,
    // filters
    filters, page, setPage, handleFilterChange,
    // mutations
    patchStatus, deleteTask, refresh,
  };
}
