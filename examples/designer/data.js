import {
  Button, Badge, Chip, Alert, Card, Spinner, Progress,
  TextField, Textarea, Select, Checkbox, Switch, Tabs, Pagination,
  Navbar, AppBar, BottomNav, FAB, IconButton,
  Stepper, Collapse, EmptyState, Table, Toast, Combobox,
} from '/dist/nexa-components.js';

export const COMPONENT_MAP = {
  Button, Badge, Chip, Alert, Card, Spinner, Progress,
  TextField, Textarea, Select, Checkbox, Switch, Tabs, Pagination,
  Navbar, AppBar, BottomNav, FAB, IconButton,
  Stepper, Collapse, EmptyState, Table, Toast, Combobox,
};

export const CATEGORIES = ['All', 'Basic', 'Form', 'Feedback', 'Navigation', 'Layout'];

export const CATALOG = [
  // ── Basic ────────────────────────────────────────────────────────────────
  {
    name: 'Button',
    label: 'Button',
    icon: 'bi-hand-index',
    category: 'Basic',
    defaultProps: { children: 'Click here', variant: 'contained' },
    propDefs: [
      { key: 'children', label: 'Text', type: 'text' },
      { key: 'variant', label: 'Variant', type: 'select', options: ['text', 'contained', 'tonal', 'outline', 'danger'] },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
    ],
  },
  {
    name: 'Badge',
    label: 'Badge',
    icon: 'bi-tag',
    category: 'Basic',
    defaultProps: { children: 'New' },
    propDefs: [
      { key: 'children', label: 'Text', type: 'text' },
      { key: 'className', label: 'Extra CSS classes', type: 'text' },
    ],
  },
  {
    name: 'Chip',
    label: 'Chip',
    icon: 'bi-bookmark',
    category: 'Basic',
    defaultProps: { children: 'Design', active: false },
    propDefs: [
      { key: 'children', label: 'Text', type: 'text' },
      { key: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    name: 'IconButton',
    label: 'IconButton',
    icon: 'bi-circle',
    category: 'Basic',
    defaultProps: { label: 'Edit', children: '✏️', variant: 'tonal' },
    propDefs: [
      { key: 'children', label: 'Icon', type: 'text' },
      { key: 'label', label: 'Accessible label', type: 'text' },
      { key: 'variant', label: 'Variant', type: 'select', options: ['text', 'tonal', 'contained', 'danger'] },
    ],
  },
  {
    name: 'FAB',
    label: 'FAB',
    icon: 'bi-plus-circle',
    category: 'Basic',
    defaultProps: { label: 'Add', children: '+', extended: false },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'children', label: 'Icon', type: 'text' },
      { key: 'extended', label: 'Extended (shows label)', type: 'boolean' },
    ],
  },
  // ── Layout ───────────────────────────────────────────────────────────────
  {
    name: 'Card',
    label: 'Card',
    icon: 'bi-card-text',
    category: 'Layout',
    defaultProps: { children: 'Card content here.', padded: true },
    propDefs: [
      { key: 'children', label: 'Content', type: 'text' },
      { key: 'padded', label: 'With padding', type: 'boolean' },
      { key: 'className', label: 'Extra CSS classes (ex: m-card-hover)', type: 'text' },
    ],
  },
  {
    name: 'Collapse',
    label: 'Collapse',
    icon: 'bi-chevron-down-circle',
    category: 'Layout',
    defaultProps: { title: 'Collapsible section', children: 'Hidden content that appears when expanded.', defaultOpen: false },
    propDefs: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'children', label: 'Content', type: 'text' },
      { key: 'defaultOpen', label: 'Open by default', type: 'boolean' },
    ],
  },
  {
    name: 'EmptyState',
    label: 'EmptyState',
    icon: 'bi-inbox',
    category: 'Layout',
    defaultProps: { title: 'No results', description: 'Try adjusting the filters or making a new search.' },
    propDefs: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
  },
  {
    name: 'Table',
    label: 'Table',
    icon: 'bi-table',
    category: 'Layout',
    wide: true,
    defaultProps: {
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'E-mail' },
        { key: 'status', header: 'Status' },
      ],
      rows: [
        { id: 1, name: 'Ana Lima', email: 'ana@ex.com', status: 'Active' },
        { id: 2, name: 'Carlos Melo', email: 'carlos@ex.com', status: 'Inactive' },
        { id: 3, name: 'Bia Rocha', email: 'bia@ex.com', status: 'Active' },
      ],
    },
    propDefs: [
      { key: 'sortable', label: 'Sortable columns', type: 'boolean' },
    ],
  },
  // ── Form ─────────────────────────────────────────────────────────────────
  {
    name: 'TextField',
    label: 'TextField',
    icon: 'bi-input-cursor',
    category: 'Form',
    defaultProps: { label: 'Name', placeholder: 'Type here...', value: '' },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'type', label: 'Input type', type: 'select', options: ['text', 'email', 'password', 'number', 'search', 'tel'] },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
      { key: 'required', label: 'Required', type: 'boolean' },
      { key: 'help', label: 'Help text', type: 'text' },
      { key: 'error', label: 'Error message', type: 'text' },
    ],
  },
  {
    name: 'Textarea',
    label: 'Textarea',
    icon: 'bi-text-paragraph',
    category: 'Form',
    defaultProps: { label: 'Description', placeholder: 'Type here...', rows: 4 },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'rows', label: 'Number of rows', type: 'number', min: 2, max: 20, step: 1 },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
    ],
  },
  {
    name: 'Select',
    label: 'Select',
    icon: 'bi-chevron-down',
    category: 'Form',
    defaultProps: {
      label: 'Choose an option',
      value: 'a',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
        { value: 'c', label: 'Option C' },
      ],
    },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
    ],
  },
  {
    name: 'Checkbox',
    label: 'Checkbox',
    icon: 'bi-check-square',
    category: 'Form',
    defaultProps: { label: 'I accept the terms of use', checked: false },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'checked', label: 'Checked', type: 'boolean' },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
    ],
  },
  {
    name: 'Switch',
    label: 'Switch',
    icon: 'bi-toggle-on',
    category: 'Form',
    defaultProps: { label: 'Enable notifications', checked: false },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'checked', label: 'On', type: 'boolean' },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
    ],
  },
  {
    name: 'Combobox',
    label: 'Combobox',
    icon: 'bi-ui-checks',
    category: 'Form',
    defaultProps: {
      label: 'Country',
      placeholder: 'Select...',
      value: 'br',
      options: [
        { value: 'br', label: 'Brazil' },
        { value: 'pt', label: 'Portugal' },
        { value: 'ar', label: 'Argentina' },
        { value: 'us', label: 'United States' },
      ],
    },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
    ],
  },
  // ── Feedback ─────────────────────────────────────────────────────────────
  {
    name: 'Alert',
    label: 'Alert',
    icon: 'bi-exclamation-triangle',
    category: 'Feedback',
    defaultProps: { variant: 'info', title: 'Information', children: 'This is an alert message.' },
    propDefs: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'children', label: 'Message', type: 'text' },
      { key: 'variant', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'danger'] },
    ],
  },
  {
    name: 'Spinner',
    label: 'Spinner',
    icon: 'bi-arrow-clockwise',
    category: 'Feedback',
    defaultProps: { label: 'Loading...' },
    propDefs: [
      { key: 'label', label: 'Accessible label', type: 'text' },
    ],
  },
  {
    name: 'Progress',
    label: 'Progress',
    icon: 'bi-bar-chart-line',
    category: 'Feedback',
    defaultProps: { value: 60, max: 100, label: 'Progress', showValue: true },
    propDefs: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'value', label: 'Current value', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'max', label: 'Maximum value', type: 'number', min: 1, max: 1000, step: 1 },
      { key: 'showValue', label: 'Show %', type: 'boolean' },
    ],
  },
  {
    name: 'Toast',
    label: 'Toast',
    icon: 'bi-bell',
    category: 'Feedback',
    defaultProps: { title: 'Operation completed', message: 'Your changes have been saved.', variant: 'success', open: true },
    propDefs: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'message', label: 'Message', type: 'text' },
      { key: 'variant', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'danger'] },
    ],
  },
  // ── Navigation ───────────────────────────────────────────────────────────
  {
    name: 'Tabs',
    label: 'Tabs',
    icon: 'bi-folder',
    category: 'Navigation',
    defaultProps: {
      value: 'inicio',
      items: [
        { value: 'inicio', label: 'Home' },
        { value: 'perfil', label: 'Profile' },
        { value: 'config', label: 'Config' },
      ],
    },
    propDefs: [
      { key: 'value', label: 'Active tab (value)', type: 'select', options: ['inicio', 'perfil', 'config'] },
    ],
  },
  {
    name: 'Pagination',
    label: 'Pagination',
    icon: 'bi-chevron-double-right',
    category: 'Navigation',
    defaultProps: { page: 3, total: 10 },
    propDefs: [
      { key: 'page', label: 'Current page', type: 'number', min: 1, max: 100, step: 1 },
      { key: 'total', label: 'Total pages', type: 'number', min: 1, max: 100, step: 1 },
    ],
  },
  {
    name: 'Navbar',
    label: 'Navbar',
    icon: 'bi-layout-text-sidebar-reverse',
    category: 'Navigation',
    wide: true,
    defaultProps: {
      brand: 'Nexa App',
      items: [
        { label: 'Home', href: '#', active: true },
        { label: 'Projects', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    propDefs: [
      { key: 'brand', label: 'Name/Logo', type: 'text' },
    ],
  },
  {
    name: 'AppBar',
    label: 'AppBar',
    icon: 'bi-window-stack',
    category: 'Navigation',
    wide: true,
    defaultProps: { title: 'Page Title' },
    propDefs: [
      { key: 'title', label: 'Title', type: 'text' },
    ],
  },
  {
    name: 'BottomNav',
    label: 'BottomNav',
    icon: 'bi-layout-split',
    category: 'Navigation',
    wide: true,
    defaultProps: {
      value: 'home',
      items: [
        { value: 'home', label: 'Home', icon: '🏠' },
        { value: 'search', label: 'Search', icon: '🔍' },
        { value: 'profile', label: 'Profile', icon: '👤' },
        { value: 'settings', label: 'Config', icon: '⚙️' },
      ],
    },
    propDefs: [
      { key: 'value', label: 'Active item', type: 'select', options: ['home', 'search', 'profile', 'settings'] },
    ],
  },
  {
    name: 'Stepper',
    label: 'Stepper',
    icon: 'bi-list-ol',
    category: 'Navigation',
    wide: true,
    defaultProps: {
      activeStep: 1,
      orientation: 'horizontal',
      steps: [
        { label: 'Personal data', description: 'Name and email' },
        { label: 'Address', description: 'City and ZIP' },
        { label: 'Confirmation', description: 'Review everything' },
      ],
    },
    propDefs: [
      { key: 'activeStep', label: 'Current step (0=first)', type: 'number', min: 0, max: 4, step: 1 },
      { key: 'orientation', label: 'Orientation', type: 'select', options: ['horizontal', 'vertical'] },
    ],
  },
];

let _idCounter = 0;

export function createItem(entry) {
  const n = _idCounter;
  _idCounter += 1;
  const col = n % 3;
  const row = Math.floor(n / 3);
  return {
    id: `${entry.name.toLowerCase()}-${_idCounter}`,
    type: entry.name,
    props: { ...entry.defaultProps },
    style: {},
    states: { hover: {}, focus: {}, active: {} },
    x: 32 + col * 376,
    y: 32 + row * 200,
  };
}

export function generateCode(items) {
  if (items.length === 0) return '// Add components to the canvas to generate code.';

  const usedTypes = [...new Set(items.map((i) => i.type))];
  const importLine = `import { ${usedTypes.join(', ')} } from '/dist/nexa-components.js';`;

  const lines = items.map((item) => '    ' + generateItemCode(item)).join(',\n');

  return `import { h } from '/dist/nexa.js';
${importLine}

function MyComponent() {
  return h('div', null,
${lines}
  );
}`;
}

// ── CSS generation ────────────────────────────────────────────────────────

export function generatePreviewCSS(item) {
  if (!item.states) return '';
  const lines = [];
  const base = `.d-canvas-item[data-id="${item.id}"] .d-canvas-item-preview`;
  const pseudo = { hover: ':hover', focus: ':focus-within', active: ':active' };

  for (const [state, styles] of Object.entries(item.states)) {
    const css = toCSS(styles);
    if (!css) continue;
    lines.push(`${base} > *${pseudo[state] || `:${state}`} { ${css} }`);
  }
  return lines.join('\n');
}

export function generateCSSCode(items) {
  const hasAnyState = items.some((i) => i.states && Object.values(i.states).some((s) => toCSS(s)));
  if (!hasAnyState) {
    return '/* No state configured.\n   Select a component → Styles tab → :hover, :focus or :active state. */';
  }

  const blocks = items.flatMap((item) => {
    if (!item.states) return [];
    const cls = `item-${item.id}`;
    const pseudoMap = { hover: ':hover', focus: ':focus', active: ':active' };
    return Object.entries(item.states)
      .filter(([, s]) => toCSS(s))
      .map(([state, styles]) => {
        const props = Object.entries(styles)
          .filter(([, v]) => v)
          .map(([k, v]) => `  ${toKebab(k)}: ${v};`)
          .join('\n');
        return `.${cls}${pseudoMap[state] || `:${state}`} {\n${props}\n}`;
      });
  });

  return `/* Add to your .css file */\n\n${blocks.join('\n\n')}`;
}

function toCSS(styles) {
  if (!styles) return '';
  return Object.entries(styles)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${toKebab(k)}: ${v}`)
    .join('; ');
}

function toKebab(s) {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function generateItemCode({ type, props, style = {}, states = {}, id }) {
  const { children, ...rest } = props;

  const cleanRest = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );

  const cleanStyle = Object.fromEntries(
    Object.entries(style).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );

  if (Object.keys(cleanStyle).length > 0) cleanRest.style = cleanStyle;

  // Add a className so the generated CSS pseudo rules can target this element
  const hasStateCSS = id && Object.values(states).some((s) => toCSS(s));
  if (hasStateCSS) {
    const cls = `item-${id}`;
    cleanRest.className = cleanRest.className ? `${cleanRest.className} ${cls}` : cls;
  }

  const hasProps = Object.keys(cleanRest).length > 0;
  const propsStr = hasProps ? formatProps(cleanRest) : 'null';
  const childStr = children != null && children !== '' ? `, ${JSON.stringify(children)}` : '';

  if (!hasProps && !childStr) return `h(${type})`;
  return `h(${type}, ${propsStr}${childStr})`;
}

function formatProps(obj) {
  const entries = Object.entries(obj).map(([k, v]) => {
    let val;
    if (typeof v === 'string') val = JSON.stringify(v);
    else if (typeof v === 'boolean' || typeof v === 'number') val = String(v);
    else val = JSON.stringify(v).replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');
    return `${k}: ${val}`;
  });
  return `{ ${entries.join(', ')} }`;
}
