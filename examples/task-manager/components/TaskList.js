import { h } from "/dist/nexa.js";
import { Badge, Chip, Dropdown, EmptyState, Spinner, Tooltip } from "/dist/nexa-components.js";

const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };
const STATUS_LABEL = {
  todo: "Pending",
  "in-progress": "In progress",
  done: "Done",
};

/**
 * Lista de tarefas. Props:
 *   tasks, loading, onEdit(task), onDelete(id), onStatusChange(id, status)
 */
export function TaskList({ tasks, loading, onEdit, onDelete, onStatusChange }) {
  if (loading) {
    return h("div", { className: "tm-loading" }, h(Spinner, { label: "Loading tasks..." }));
  }

  if (!tasks || tasks.length === 0) {
    return h(EmptyState, {
      title: "No tasks found",
      description: "Try adjusting the filters or create a new task.",
    });
  }

  return h(
    "div",
    { className: "tm-task-list" },
    tasks.map((task) => h(TaskRow, { key: task.id, task, onEdit, onDelete, onStatusChange })),
  );
}

function TaskRow({ task, onEdit, onDelete, onStatusChange }) {
  const isDone = task.status === "done";
  const statusItems = [
    {
      key: "todo",
      label: "Mark as Pending",
      disabled: task.status === "todo",
      onClick: () => onStatusChange(task.id, "todo"),
    },
    {
      key: "in-progress",
      label: "Mark as In progress",
      disabled: task.status === "in-progress",
      onClick: () => onStatusChange(task.id, "in-progress"),
    },
    {
      key: "done",
      label: "Mark as Done",
      disabled: task.status === "done",
      onClick: () => onStatusChange(task.id, "done"),
    },
    { key: "div1", divider: true },
    {
      key: "edit",
      label: "Edit",
      onClick: () => onEdit(task),
    },
    {
      key: "delete",
      label: "Delete",
      danger: true,
      onClick: () => onDelete(task.id),
    },
  ];

  return h(
    "div",
    { className: `tm-task-row${isDone ? " tm-task-row-done" : ""}` },

    // Quick completion checkbox
    h("input", {
      type: "checkbox",
      className: "tm-task-check",
      checked: isDone,
      title: isDone ? "Mark as pending" : "Mark as done",
      onChange: () => onStatusChange(task.id, isDone ? "todo" : "done"),
    }),

    // Corpo
    h(
      "div",
      { className: "tm-task-body" },
      h(
        "div",
        { className: "tm-task-title" },
        task.description
          ? h(
              Tooltip,
              { content: task.description, position: "top" },
              h("span", { className: "tm-detail-trigger" }, task.title),
            )
          : task.title,
      ),
      task.description &&
        h("div", { className: "tm-task-desc" }, task.description),
    ),

    // Meta (badges)
    h(
      "div",
      { className: "tm-task-meta" },
      h(Chip, { className: `tm-prio-${task.priority}` }, PRIORITY_LABEL[task.priority] || task.priority),
      h(Badge, null, STATUS_LABEL[task.status] || task.status),
    ),

    // Actions
    h(
      "div",
      { className: "tm-task-actions" },
      h(Dropdown, {
        align: "right",
        trigger: h("button", { type: "button", className: "m-button m-button-tonal" }, "⋮"),
        items: statusItems,
      }),
    ),
  );
}
