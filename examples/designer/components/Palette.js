import { h, useState } from '/dist/nexa.js';
import { CATALOG, CATEGORIES } from '../data.js';

export function Palette({ onAdd }) {
  const [category, setCategory] = useState('All');

  const visible = category === 'All'
    ? CATALOG
    : CATALOG.filter((c) => c.category === category);

  const grouped = {};
  for (const entry of visible) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }

  return h('aside', { className: 'd-palette' },
    h('div', { className: 'd-palette-head' },
      h('span', { className: 'd-palette-title' }, 'Components'),
    ),

    h('div', { className: 'd-palette-filters' },
      CATEGORIES.map((cat) =>
        h('button', {
          key: cat,
          className: `d-filter-btn${category === cat ? ' is-active' : ''}`,
          onClick: () => setCategory(cat),
        }, cat),
      ),
    ),

    h('div', { className: 'd-palette-list' },
      Object.entries(grouped).map(([cat, entries]) =>
        h('div', { key: cat },
          h('p', { className: 'd-palette-category' }, cat),
          entries.map((entry) =>
            h('button', {
              key: entry.name,
              className: 'd-palette-item',
              title: `Add ${entry.label}`,
              onClick: () => onAdd(entry),
            },
            h('i', { className: `${entry.icon} d-palette-icon` }),
            h('span', null, entry.label),
            h('i', { className: 'bi-plus d-palette-plus' }),
            ),
          ),
        ),
      ),
    ),
  );
}
