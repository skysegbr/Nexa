export const BASIC_ENTRIES = [
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
];
