# Nexa UI

Nexa UI is a small CSS framework designed to pair with Nexa. It borrows ideas
from Material Design: theme tokens, surfaces, subtle elevation, buttons, fields,
chips, lists, and visual states.

It does not require Node or a build step. Just import the CSS in your HTML.

```html
<link rel="stylesheet" href="./nexa-ui.css" />
```

Or load the public build from jsDelivr:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-ui.css"
/>
```

For component helpers, import the optional JavaScript module:

```js
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Drawer,
  Dropdown,
  EmptyState,
  IconButton,
  Pagination,
  Progress,
  Select,
  Spinner,
  Tabs,
  Table,
  Textarea,
  TextField,
  Tooltip,
  Toast,
} from "./nexa-components.js";
```

CDN import:

```js
import {
  Button,
  Card,
  TextField,
} from "https://cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa-components.js";
```

## Tokens

The theme lives in CSS variables:

```css
:root {
  --m-primary: #0f766e;
  --m-secondary: #3f4f9f;
  --m-danger: #b42318;
  --m-bg: #f4f6f8;
  --m-surface: #ffffff;
  --m-text: #18212b;
  --m-radius: 8px;
}
```

You can override them in your app:

```css
:root {
  --m-primary: #3157d5;
  --m-focus: #b9c8ff;
}
```

## Main Classes

Layout:

```html
<section class="m-app">
  <main class="m-page m-stack"></main>
</section>
```

Application shell:

```js
h(
  "div",
  { className: "m-app-shell" },
  h("aside", { className: "m-sidebar" }, "Navigation"),
  h(
    "div",
    null,
    h("header", { className: "m-topbar" }, "Topbar"),
    h("main", { className: "m-content" }, h("div", { className: "m-container" })),
  ),
)
```

Typography:

```js
h("p", { className: "m-eyebrow" }, "Nexa UI")
h("h1", { className: "m-title-xl" }, "Todo list")
h("p", { className: "m-body" }, "Supporting text")
```

Card:

```js
h(
  "article",
  { className: "m-card m-card-padded" },
  h("h2", null, "Summary"),
  h("p", { className: "m-body" }, "Card content"),
)
```

Field:

```js
h("input", {
  className: "m-field",
  value: title,
  onInput: (event) => setTitle(event.target.value),
  placeholder: "New task",
})
```

Buttons:

```js
h("button", { className: "m-button" }, "Text")
h("button", { className: "m-button m-button-contained" }, "Save")
h("button", { className: "m-button m-button-tonal" }, "Filter")
h("button", { className: "m-button m-button-danger" }, "Remove")
```

Or with component helpers:

```js
h(Button, { variant: "contained", onClick: save }, "Save")
h(IconButton, { label: "Previous" }, "<")
```

Fields:

```js
h(TextField, {
  id: "email",
  label: "Email",
  value: email,
  onInput: (event) => setEmail(event.target.value),
  error: emailError,
})

h(Select, {
  id: "status",
  label: "Status",
  value: status,
  onChange: (event) => setStatus(event.target.value),
  options: [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ],
})
```

Feedback:

```js
h(Alert, { variant: "success", title: "Saved" }, "Your changes are ready.")
h(Badge, null, "4")
h(Spinner, { label: "Loading products" })
h(Toast, { open: saved, variant: "success", title: "Saved", onClose: closeToast })
h(Progress, { value: 60, max: 100, label: "Completion" })
```

Tabs:

```js
h(Tabs, {
  value: tab,
  onChange: setTab,
  items: [
    { value: "overview", label: "Overview" },
    { value: "settings", label: "Settings" },
  ],
})
```

Dialog:

```js
h(
  Dialog,
  {
    open,
    title: "Edit project",
    onClose: closeDialog,
    actions: h(Button, { variant: "contained", onClick: save }, "Save"),
  },
  h(TextField, { id: "name", label: "Name", value: name }),
)
```

Table:

```js
h(Table, {
  columns: [
    { key: "name", header: "Name" },
    { key: "status", header: "Status" },
  ],
  rows: projects,
})

h(EmptyState, {
  title: "No projects",
  description: "Create a project to fill this table.",
})
```

Drawer:

```js
h(
  Drawer,
  {
    open,
    side: "right",
    width: 400,
    title: "Edit task",
    onClose: closeDrawer,
  },
  h(TextField, { id: "task-title", label: "Title", value: title }),
)
```

Dropdown:

```js
h(Dropdown, {
  align: "right",
  trigger: h("button", { type: "button", className: "m-button m-button-tonal" }, "Actions"),
  items: [
    { key: "edit", label: "Edit", onClick: edit },
    { key: "delete", label: "Delete", danger: true, onClick: remove },
  ],
})
```

Tooltip and pagination:

```js
h(Tooltip, { content: "More details" }, h("span", null, "Info"))
h(Pagination, { page, total: 8, siblings: 1, onChange: setPage })
```

Chips:

```js
h("button", { className: "m-chip" }, "All")
h("button", { className: "m-chip m-chip-active" }, "Pending")
```

List:

```js
h(
  "ul",
  { className: "m-list" },
  todos.map((todo) =>
    h(
      "li",
      { className: "m-list-item" },
      h("span", null, todo.title),
      h("button", { className: "m-button" }, "Open"),
    ),
  ),
)
```

Checkbox:

```js
h(
  "label",
  { className: "m-checkbox" },
  h("input", { type: "checkbox", checked: todo.completed }),
  h("span", null, todo.title),
)
```

Inline forms:

```js
h(
  "form",
  { className: "m-form-row" },
  h("input", { className: "m-field", placeholder: "New card" }),
  h("button", { className: "m-button m-button-contained" }, "Add"),
)
```

Actions and icon buttons:

```js
h(
  "div",
  { className: "m-actions" },
  h("button", { className: "m-button m-button-tonal m-icon-button" }, "<"),
  h("button", { className: "m-button m-button-tonal m-icon-button" }, ">"),
)
```

Responsive grid:

```js
h(
  "section",
  { className: "m-responsive-grid" },
  h("article", { className: "m-card m-card-padded" }, "Column 1"),
  h("article", { className: "m-card m-card-padded" }, "Column 2"),
  h("article", { className: "m-card m-card-padded" }, "Column 3"),
)
```

Board/Kanban:

```js
h(
  "article",
  { className: "m-card m-board-column m-dropzone" },
  h(
    "header",
    { className: "m-board-column-header" },
    h("div", null, h("h2", null, "Doing"), h("p", null, "In progress")),
    h("span", { className: "m-chip" }, "2"),
  ),
  h(
    "ul",
    { className: "m-list" },
    h(
      "li",
      { className: "m-list-item m-board-card m-draggable" },
      h("p", null, "Create drag and drop"),
    ),
  ),
)
```

Drag and drop states:

```js
h("li", { className: "m-list-item m-board-card m-draggable m-dragging" })
h("article", { className: "m-card m-board-column m-dropzone m-dropzone-active" })
```

## Using It In The Current Project

The todo list already imports:

```html
<link rel="stylesheet" href="./nexa-ui.css" />
<link rel="stylesheet" href="./styles.css" />
```

`nexa-ui.css` contains the reusable framework.
`styles.css` contains only the page-specific layout.
