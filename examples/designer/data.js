import {
  Button, Badge, Chip, Alert, Card, Spinner, Progress,
  TextField, Textarea, Select, Checkbox, Switch, Tabs, Pagination,
  Navbar, AppBar, BottomNav, FAB, IconButton,
  Stepper, Collapse, EmptyState, Table, Toast, Combobox,
} from '/dist/nexa-components.js';

import { BASIC_ENTRIES } from './catalog/basic.js';
import { LAYOUT_ENTRIES } from './catalog/layout.js';
import { FORM_ENTRIES } from './catalog/form.js';
import { FEEDBACK_ENTRIES } from './catalog/feedback.js';
import { NAVIGATION_ENTRIES } from './catalog/navigation.js';

export const COMPONENT_MAP = {
  Button, Badge, Chip, Alert, Card, Spinner, Progress,
  TextField, Textarea, Select, Checkbox, Switch, Tabs, Pagination,
  Navbar, AppBar, BottomNav, FAB, IconButton,
  Stepper, Collapse, EmptyState, Table, Toast, Combobox,
};

export const CATEGORIES = ['All', 'Basic', 'Form', 'Feedback', 'Navigation', 'Layout'];

export const CATALOG = [
  ...BASIC_ENTRIES,
  ...LAYOUT_ENTRIES,
  ...FORM_ENTRIES,
  ...FEEDBACK_ENTRIES,
  ...NAVIGATION_ENTRIES,
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
