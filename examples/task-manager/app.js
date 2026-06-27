import { h, render, useState } from "../../dist/nexa.js";
import { Alert, Button, Dropdown, Pagination, ThemeToggle, Toast } from "../../dist/nexa-components.js";

import { DeleteDialog } from "./components/DeleteDialog.js";
import { FilterBar } from "./components/FilterBar.js";
import { StatsRow } from "./components/StatsRow.js";
import { TaskDrawer } from "./components/TaskDrawer.js";
import { TaskList } from "./components/TaskList.js";
import { useTaskManager } from "./components/useTaskManager.js";

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (variant, message) => setToast({ variant, message });

  // ── Data / mutations from custom hook ─────────────────────────────────────
  const {
    tasks, totalTasks, totalPages, stats, categories,
    loadingTasks, loadingStats, fetchError,
    filters, page, setPage, handleFilterChange,
    patchStatus, deleteTask, refresh,
  } = useTaskManager();

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    try {
      await patchStatus(id, status);
      showToast("success", status === "done" ? "Task completed!" : "Status updated.");
    } catch {
      showToast("danger", "Error updating status.");
    }
  };

  const handleSaved = () => {
    setDrawerOpen(false);
    showToast("success", editingTask ? "Task updated!" : "Task created!");
    setEditingTask(null);
    refresh();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
      showToast("success", "Task deleted.");
    } catch {
      showToast("danger", "Error deleting task.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const sortItems = [
    { key: "createdAt", label: "Creation date", onClick: () => handleFilterChange("sort", "createdAt") },
    { key: "title", label: "Title (A-Z)", onClick: () => handleFilterChange("sort", "title") },
    { key: "priority", label: "Priority", onClick: () => handleFilterChange("sort", "priority") },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return h(
    "div",
    { className: "tm-layout" },

    h(
      "header",
      { className: "tm-topbar" },
      h("span", { className: "tm-topbar-brand" }, "Task Manager"),
      h(Dropdown, {
        align: "right",
        trigger: h("button", { type: "button", className: "m-button m-button-tonal" },
          `Sort: ${sortItems.find((s) => s.key === filters.sort)?.label || "-"} ▾`),
        items: sortItems,
      }),
      h(ThemeToggle, null),
      h(Button, { variant: "contained", onClick: () => { setEditingTask(null); setDrawerOpen(true); } },
        "+ New task"),
    ),

    h(
      "main",
      { className: "tm-main" },
      h(StatsRow, { stats, loading: loadingStats }),
      fetchError && h(Alert, { variant: "danger", title: "Connection error" }, fetchError),
      h(FilterBar, { filters, categories, onChange: handleFilterChange }),
      h(TaskList, {
        tasks,
        loading: loadingTasks,
        onEdit: (task) => { setEditingTask(task); setDrawerOpen(true); },
        onDelete: (id) => {
          const task = tasks.find((t) => t.id === id);
          setDeleteTarget({ id, title: task?.title || id });
        },
        onStatusChange: handleStatusChange,
      }),
      !loadingTasks && totalPages > 0 && h(
        "div",
        { className: "tm-pagination-row" },
        h("span", null, `${totalTasks} task${totalTasks !== 1 ? "s" : ""} found`),
        h(Pagination, { page, total: totalPages, siblings: 1, onChange: setPage }),
      ),
    ),

    h(TaskDrawer, {
      open: drawerOpen,
      task: editingTask,
      categories,
      onClose: () => { setDrawerOpen(false); setEditingTask(null); },
      onSaved: handleSaved,
    }),

    h(DeleteDialog, {
      open: Boolean(deleteTarget),
      taskTitle: deleteTarget?.title || "",
      onConfirm: handleDeleteConfirm,
      onClose: () => setDeleteTarget(null),
    }),

    toast && h(Toast, {
      key: toast.message,
      open: true,
      variant: toast.variant,
      message: toast.message,
      duration: 3500,
      onClose: () => setToast(null),
      style: { position: "fixed", bottom: "24px", right: "24px", zIndex: 200 },
    }),
  );
}

render(App, document.getElementById("app"));
