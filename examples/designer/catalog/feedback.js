export const FEEDBACK_ENTRIES = [
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
];
