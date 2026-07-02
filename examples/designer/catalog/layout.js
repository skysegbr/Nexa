export const LAYOUT_ENTRIES = [
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
];
