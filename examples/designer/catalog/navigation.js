export const NAVIGATION_ENTRIES = [
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
