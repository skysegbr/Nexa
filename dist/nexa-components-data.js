/*!
 * Nexa — UI component library, `data` category: data display (Table, DataTable, TreeView, Accordion, Stat, ...).
 * Part of the no-build Nexa framework — NOT React; see the AI/LLM notice
 * in ./nexa-components-core.js and https://github.com/skysegbr/Nexa
 * Import only the categories you use, or everything via ./nexa-components.js.
 */
import { h, useRef, useState, useMemo } from "./nexa.js";
import { finiteNumber, hasChildren, joinClasses } from "./nexa-components-util.js";
import { EmptyState } from "./nexa-components-core.js";

export function Table({
  columns = [],
  rows = [],
  getRowKey = (row, index) => row.id ?? index,
  emptyTitle = "No rows",
  emptyDescription = "Try changing the filters.",
  sortable = false,
  defaultSort,
  onSort,
  className = "",
  ...props
} = {}) {
  const [sort, setSort] = useState(defaultSort ?? { key: null, dir: "asc" });

  const sortedRows = useMemo(() => {
    if (!sortable || !sort.key) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, sortable]);

  const handleSort = (key) => {
    if (!sortable) return;
    const next = { key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" };
    setSort(next);
    onSort?.(next);
  };

  return h(
    "div",
    { className: joinClasses("m-table-wrap", className) },
    h(
      "table",
      { ...props, className: "m-table" },
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          columns.map((column) =>
            h(
              "th",
              {
                key: column.key,
                scope: "col",
                className: joinClasses(
                  column.align === "right" && "m-table-cell-right",
                  sortable && column.sortable !== false && "m-table-th-sortable",
                  sortable && sort.key === column.key && "m-table-th-sorted",
                ),
                onClick: sortable && column.sortable !== false
                  ? () => handleSort(column.key)
                  : undefined,
                ariaSort: sort.key === column.key
                  ? sort.dir === "asc" ? "ascending" : "descending"
                  : undefined,
              },
              column.header,
              sortable && column.sortable !== false && h(
                "span",
                { className: "m-table-sort-icon", ariaHidden: "true" },
                sort.key === column.key
                  ? sort.dir === "asc" ? "↑" : "↓"
                  : "↕",
              ),
            ),
          ),
        ),
      ),
      sortedRows.length > 0
        ? h(
            "tbody",
            null,
            sortedRows.map((row, rowIndex) =>
              h(
                "tr",
                { key: getRowKey(row, rowIndex) },
                columns.map((column) =>
                  h(
                    "td",
                    {
                      key: column.key,
                      className: column.align === "right" && "m-table-cell-right",
                    },
                    column.render ? column.render(row, rowIndex) : row[column.key],
                  ),
                ),
              ),
            ),
          )
        : h(
            "tbody",
            null,
            h(
              "tr",
              null,
              h(
                "td",
                { colSpan: columns.length || 1 },
                h(EmptyState, { title: emptyTitle, description: emptyDescription }),
              ),
            ),
          ),
    ),
  );
}

export function Pagination({
  page = 1,
  total = 1,
  siblings = 1,
  onChange,
  className = "",
} = {}) {
  const safeTotal = Math.max(1, Math.floor(finiteNumber(total, 1)));
  const safePage = Math.min(safeTotal, Math.max(1, Math.floor(finiteNumber(page, 1))));
  const pages = buildPageRange(safePage, safeTotal, siblings);

  return h(
    "nav",
    { className: joinClasses("m-pagination", className), ariaLabel: "Pagination" },
    h(
      "button",
      {
        type: "button",
        className: "m-pagination-item",
        disabled: safePage <= 1,
        onClick: () => onChange?.(safePage - 1),
        ariaLabel: "Previous page",
      },
      "\u2039",
    ),
    pages.map((p, index) =>
      p === null
        ? h("span", { key: `ellipsis-${index}`, className: "m-pagination-ellipsis" }, "\u2026")
        : h(
            "button",
            {
              key: p,
              type: "button",
              className: joinClasses(
                "m-pagination-item",
                p === safePage && "m-pagination-item-active",
              ),
              ariaCurrent: p === safePage ? "page" : undefined,
              onClick: () => onChange?.(p),
            },
            String(p),
          ),
    ),
    h(
      "button",
      {
        type: "button",
        className: "m-pagination-item",
        disabled: safePage >= safeTotal,
        onClick: () => onChange?.(safePage + 1),
        ariaLabel: "Next page",
      },
      "\u203a",
    ),
  );
}

function buildPageRange(page, total, siblings) {
  if (total <= 1) return [1];

  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;
  const range = [1];

  if (showLeftEllipsis) range.push(null);

  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== total) range.push(p);
  }

  if (showRightEllipsis) range.push(null);
  if (total > 1) range.push(total);

  return range;
}


// ── Collapse ───────────────────────────────────────────────

export function Collapse({
  title,
  defaultOpen = false,
  open,
  onToggle,
  actions,
  badge,
  className = "",
  children,
  ...props
} = {}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : internalOpen;

  const toggle = () => {
    if (open === undefined) setInternalOpen((v) => !v);
    onToggle?.(!isOpen);
  };

  return h(
    "div",
    { ...props, className: joinClasses("m-collapse", isOpen && "m-collapse-open", className) },
    h(
      "button",
      {
        type: "button",
        className: "m-collapse-header",
        onClick: toggle,
        ariaExpanded: isOpen ? "true" : "false",
      },
      h("span", { className: "m-collapse-chevron", ariaHidden: "true" }),
      h("span", { className: "m-collapse-title" }, title),
      badge && h("span", { className: "m-collapse-badge" }, badge),
      hasChildren(actions) &&
        h(
          "span",
          {
            className: "m-collapse-actions",
            onClick: (e) => e.stopPropagation(),
          },
          actions,
        ),
    ),
    h(
      "div",
      { className: "m-collapse-body-wrap" },
      h("div", { className: "m-collapse-body-inner" },
        h("div", { className: "m-collapse-body" }, children),
      ),
    ),
  );
}

// ── Accordion ──────────────────────────────────────────────
//
// Multiple collapsible panels in a single grouped container.
//
// Props:
//   items        [{ key, title, children, disabled? }]
//   multiple     allow several panels open at once (default false)
//   defaultOpen  initially-open key or array of keys (uncontrolled)
//   open         controlled: key | key[] | undefined
//   onToggle     (key, nextOpenKeys) => void
//   className    extra CSS classes
//
// Keyboard: trigger buttons are native <button> elements — Enter and Space
// activate them for free. aria-expanded + aria-controls wire up screen readers.

function normalizeAccordionOpen(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

export function Accordion({
  items = [],
  multiple = false,
  defaultOpen,
  open,
  onToggle,
  className = "",
  ...props
} = {}) {
  const [internalOpen, setInternalOpen] = useState(() => normalizeAccordionOpen(defaultOpen));
  const openKeys = open !== undefined ? normalizeAccordionOpen(open) : internalOpen;

  const toggle = (key) => {
    const isOpen = openKeys.includes(key);
    const nextOpenKeys = multiple
      ? isOpen ? openKeys.filter((k) => k !== key) : [...openKeys, key]
      : isOpen ? [] : [key];
    if (open === undefined) setInternalOpen(nextOpenKeys);
    onToggle?.(key, nextOpenKeys);
  };

  return h(
    "div",
    { ...props, className: joinClasses("m-accordion", className) },
    items.map((item) => {
      const isOpen = openKeys.includes(item.key);
      const headerId = `${item.key}-header`;
      const panelId = `${item.key}-panel`;

      return h(
        "div",
        {
          key: item.key,
          className: joinClasses("m-accordion-item", isOpen && "m-accordion-item-open"),
        },
        h(
          "button",
          {
            id: headerId,
            type: "button",
            className: "m-accordion-header",
            disabled: item.disabled,
            ariaExpanded: isOpen ? "true" : "false",
            ariaControls: panelId,
            onClick: item.disabled ? undefined : () => toggle(item.key),
            onKeyDown: item.disabled ? undefined : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(item.key);
              }
            },
          },
          h("span", { className: "m-accordion-chevron", ariaHidden: "true" }),
          h("span", { className: "m-accordion-title" }, item.title),
        ),
        h(
          "div",
          {
            id: panelId,
            role: "region",
            className: "m-accordion-body-wrap",
            ariaLabelledby: headerId,
          },
          h(
            "div",
            { className: "m-accordion-body-inner" },
            h("div", { className: "m-accordion-body" }, item.children),
          ),
        ),
      );
    }),
  );
}

// ── DataTable ────────────────────────────────────────────────
//
// Table + Pagination combined: sorts the full row set, then renders only
// the current page. Table alone can't do this — its sort state lives
// entirely inside it, invisible to whatever would need to slice by page —
// so DataTable owns sorting itself and renders its own header/body (same
// markup/classes as Table) instead of wrapping it. Column shape and the
// sort algorithm match Table exactly.
//
// Props:
//   columns      [{ key, header, align?, render?, sortable? }]
//   rows         full (unsliced) row data
//   pageSize     rows per page (default 10)
//   page         controlled current page (1-based); omit for uncontrolled
//   onPageChange (page) => void
//   sortable     enable header sort (default true)
//   defaultSort  { key, dir } — initial sort, uncontrolled
//   onSort       ({ key, dir }) => void
//   getRowKey    (row, index) => key

export function DataTable({
  columns = [],
  rows = [],
  pageSize = 10,
  page,
  onPageChange,
  sortable = true,
  defaultSort,
  onSort,
  getRowKey = (row, index) => row.id ?? index,
  emptyTitle = "No rows",
  emptyDescription = "Try changing the filters.",
  className = "",
  ...props
} = {}) {
  const [sort, setSort] = useState(defaultSort ?? { key: null, dir: "asc" });
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = page !== undefined ? page : internalPage;

  const setPage = (next) => {
    if (page === undefined) setInternalPage(next);
    onPageChange?.(next);
  };

  const sortedRows = useMemo(() => {
    if (!sortable || !sort.key) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, sortable]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, currentPage));
  const pageRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    const next = { key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" };
    setSort(next);
    onSort?.(next);
    setPage(1);
  };

  return h(
    "div",
    { className: joinClasses("m-data-table", className) },
    h(
      "div",
      { className: "m-table-wrap" },
      h(
        "table",
        { ...props, className: "m-table" },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            columns.map((column) =>
              h(
                "th",
                {
                  key: column.key,
                  scope: "col",
                  className: joinClasses(
                    column.align === "right" && "m-table-cell-right",
                    sortable && column.sortable !== false && "m-table-th-sortable",
                    sortable && sort.key === column.key && "m-table-th-sorted",
                  ),
                  onClick: sortable && column.sortable !== false
                    ? () => handleSort(column.key)
                    : undefined,
                  ariaSort: sort.key === column.key
                    ? sort.dir === "asc" ? "ascending" : "descending"
                    : undefined,
                },
                column.header,
                sortable && column.sortable !== false && h(
                  "span",
                  { className: "m-table-sort-icon", ariaHidden: "true" },
                  sort.key === column.key
                    ? sort.dir === "asc" ? "↑" : "↓"
                    : "↕",
                ),
              ),
            ),
          ),
        ),
        pageRows.length > 0
          ? h(
              "tbody",
              null,
              pageRows.map((row, rowIndex) =>
                h(
                  "tr",
                  { key: getRowKey(row, rowIndex) },
                  columns.map((column) =>
                    h(
                      "td",
                      {
                        key: column.key,
                        className: column.align === "right" && "m-table-cell-right",
                      },
                      column.render ? column.render(row, rowIndex) : row[column.key],
                    ),
                  ),
                ),
              ),
            )
          : h(
              "tbody",
              null,
              h(
                "tr",
                null,
                h(
                  "td",
                  { colSpan: columns.length || 1 },
                  h(EmptyState, { title: emptyTitle, description: emptyDescription }),
                ),
              ),
            ),
      ),
    ),
    sortedRows.length > pageSize &&
      h(Pagination, {
        className: "m-data-table-pagination",
        page: safePage,
        total: totalPages,
        onChange: setPage,
      }),
  );
}

// ── Stat / StatGrid ──────────────────────────────────────────
//
// KPI tile: big value + small label, with an optional delta ("+12%" / "-3%")
// that colors itself by its leading sign. StatGrid is the auto-fit wrapper.

export function Stat({
  value,
  label,
  icon,
  delta,
  help,
  className = "",
  ...props
} = {}) {
  const deltaDown = typeof delta === "string" && delta.trim().startsWith("-");

  return h(
    "div",
    { ...props, className: joinClasses("m-stat", className) },
    icon && h("span", { className: "m-stat-icon", ariaHidden: "true" }, icon),
    h("strong", { className: "m-stat-value" }, value),
    h(
      "span",
      { className: "m-stat-label" },
      label,
      delta &&
        h(
          "span",
          { className: joinClasses("m-stat-delta", deltaDown ? "m-stat-delta-down" : "m-stat-delta-up") },
          ` ${delta}`,
        ),
    ),
    help && h("p", { className: "m-stat-help" }, help),
  );
}

export function StatGrid({ className = "", children, ...props } = {}) {
  return h("div", { ...props, className: joinClasses("m-stat-grid", className) }, children);
}

// ── TreeView ─────────────────────────────────────────────────
//
// WAI-ARIA tree: nodes are `{ id, label, icon?, children? }`. Expansion is
// uncontrolled by default (defaultExpanded) or controlled via `expanded` +
// onExpandedChange; selection is always controlled (selected/onSelect).
// Keyboard follows the ARIA authoring pattern with a roving tabindex over
// the *visible* nodes: ArrowUp/Down walk, ArrowRight expands / enters a
// branch, ArrowLeft collapses / climbs to the parent, Home/End jump,
// Enter/Space select.

function flattenVisibleTree(items, isExpanded, parent = null, out = []) {
  for (const node of items) {
    out.push({ node, parent });
    if (node.children?.length && isExpanded(node.id)) {
      flattenVisibleTree(node.children, isExpanded, node, out);
    }
  }
  return out;
}

export function TreeView({
  items = [],
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  selected,
  onSelect,
  ariaLabel = "Tree",
  className = "",
  ...props
} = {}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [focusedId, setFocusedId] = useState(null);
  const treeRef = useRef(null);

  const expandedIds = expanded ?? internalExpanded;
  const isExpanded = (nodeId) => expandedIds.includes(nodeId);

  const setExpandedIds = (next) => {
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const toggleNode = (nodeId) => {
    setExpandedIds(
      isExpanded(nodeId) ? expandedIds.filter((x) => x !== nodeId) : [...expandedIds, nodeId],
    );
  };

  const visible = flattenVisibleTree(items, isExpanded);
  // The roving stop falls back to the selected node (or the first root) when
  // focus never entered the tree, or when the focused node was hidden by a
  // collapse.
  const rovingId = visible.some(({ node }) => node.id === focusedId)
    ? focusedId
    : visible.find(({ node }) => node.id === selected)?.node.id ?? visible[0]?.node.id;

  const focusNode = (nodeId) => {
    setFocusedId(nodeId);
    queueMicrotask(() =>
      treeRef.current?.querySelector(`[data-id="${CSS.escape(String(nodeId))}"]`)?.focus(),
    );
  };

  const onTreeKeyDown = (event) => {
    const index = visible.findIndex(({ node }) => node.id === rovingId);
    if (index === -1) return;
    const { node, parent } = visible[index];
    const hasKids = node.children?.length > 0;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = visible[index + (event.key === "ArrowDown" ? 1 : -1)];
      if (next) focusNode(next.node.id);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (hasKids && !isExpanded(node.id)) toggleNode(node.id);
      else if (hasKids) focusNode(node.children[0].id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (hasKids && isExpanded(node.id)) toggleNode(node.id);
      else if (parent) focusNode(parent.id);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (visible.length) focusNode(visible[0].node.id);
    } else if (event.key === "End") {
      event.preventDefault();
      if (visible.length) focusNode(visible[visible.length - 1].node.id);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(node.id, node);
    }
  };

  const renderNode = (node) => {
    const hasKids = node.children?.length > 0;
    const nodeOpen = hasKids && isExpanded(node.id);

    return h(
      "li",
      {
        key: node.id,
        role: "treeitem",
        className: joinClasses("m-tree-item", node.id === selected && "m-tree-item-selected"),
        dataset: { id: node.id },
        tabIndex: node.id === rovingId ? 0 : -1,
        ariaExpanded: hasKids ? String(nodeOpen) : undefined,
        ariaSelected: node.id === selected ? "true" : "false",
      },
      h(
        "div",
        {
          className: "m-tree-row",
          onClick: (event) => {
            event.stopPropagation();
            focusNode(node.id);
            onSelect?.(node.id, node);
          },
        },
        h(
          "span",
          {
            className: joinClasses(
              "m-tree-caret",
              nodeOpen && "m-tree-caret-open",
              !hasKids && "m-tree-caret-leaf",
            ),
            ariaHidden: "true",
            onClick: hasKids
              ? (event) => {
                  event.stopPropagation();
                  toggleNode(node.id);
                }
              : undefined,
          },
          "▸",
        ),
        node.icon && h("span", { className: "m-tree-icon", ariaHidden: "true" }, node.icon),
        h("span", { className: "m-tree-label" }, node.label),
      ),
      nodeOpen &&
        h("ul", { role: "group", className: "m-tree-group" }, node.children.map(renderNode)),
    );
  };

  return h(
    "ul",
    {
      ...props,
      ref: treeRef,
      role: "tree",
      ariaLabel,
      className: joinClasses("m-tree", className),
      onKeyDown: onTreeKeyDown,
    },
    items.map(renderNode),
  );
}
