import { h, useState } from '/dist/nexa.js';
import { CATALOG } from '../data.js';
import { CSS_GROUPS, StyleGroup } from './StyleEditors.js';

const STATES = [
  { key: 'normal', label: 'Normal' },
  { key: 'hover',  label: ':hover'  },
  { key: 'focus',  label: ':focus'  },
  { key: 'active', label: ':active' },
];

export function Inspector({ item, onUpdate, onStyleUpdate, onStateUpdate, onDelete, onMove, onDuplicate }) {
  const [tab, setTab] = useState('props');
  const [activeState, setActiveState] = useState('normal');

  if (!item) {
    return h('aside', { className: 'd-inspector' },
      h('div', { className: 'd-inspector-empty' },
        h('i', { className: 'bi-sliders d-inspector-empty-icon' }),
        h('p', null, 'Select a component'),
        h('p', { className: 'd-inspector-empty-sub' }, 'Properties will appear here'),
      ),
    );
  }

  const entry = CATALOG.find((c) => c.name === item.type);
  if (!entry) return null;

  function setProp(key, value) {
    onUpdate(item.id, { ...item.props, [key]: value });
  }

  function setStyle(key, value) {
    if (activeState === 'normal') {
      const next = { ...item.style };
      if (value === null || value === undefined || value === '') delete next[key];
      else next[key] = value;
      onStyleUpdate(item.id, next);
    } else {
      const current = item.states?.[activeState] || {};
      const next = { ...current };
      if (value === null || value === undefined || value === '') delete next[key];
      else next[key] = value;
      onStateUpdate(item.id, activeState, next);
    }
  }

  function clearAllStylesForState() {
    if (activeState === 'normal') onStyleUpdate(item.id, {});
    else onStateUpdate(item.id, activeState, {});
  }

  const currentStyle = activeState === 'normal'
    ? (item.style || {})
    : (item.states?.[activeState] || {});

  const hasStyles = Object.keys(currentStyle).length > 0;

  const hasAnyState = item.states &&
    Object.values(item.states).some((s) => Object.keys(s || {}).length > 0);

  return h('aside', { className: 'd-inspector' },

    h('div', { className: 'd-inspector-head' },
      h('div', { className: 'd-inspector-type' },
        h('i', { className: entry.icon }),
        h('strong', null, entry.label),
      ),
      h('span', { className: 'd-inspector-id' }, item.id),
    ),

    h('div', { className: 'd-inspector-tabs' },
      h('button', {
        className: `d-itab${tab === 'props' ? ' is-active' : ''}`,
        onClick: () => setTab('props'),
      }, 'Properties'),
      h('button', {
        className: `d-itab${tab === 'style' ? ' is-active' : ''}`,
        onClick: () => setTab('style'),
      }, (hasStyles || hasAnyState)
        ? h('span', null, 'Styles ', h('span', { className: 'd-style-dot' }))
        : 'Styles',
      ),
    ),

    tab === 'props'
      ? h('div', { className: 'd-inspector-props' },
          entry.propDefs.map((def) =>
            h('div', { key: def.key, className: 'd-prop-row' },
              h('label', { className: 'd-prop-label' }, def.label),
              h(PropEditor, { def, value: item.props[def.key], onChange: (v) => setProp(def.key, v) }),
            ),
          ),
        )
      : h('div', { className: 'd-inspector-props' },

          // ── State selector ─────────────────────────────────────────────
          h('div', { className: 'd-state-bar' },
            h('span', { className: 'd-state-label' }, 'State:'),
            STATES.map((s) => {
              const dot = s.key !== 'normal' && Object.keys(item.states?.[s.key] || {}).length > 0;
              return h('button', {
                key: s.key,
                className: `d-state-btn${activeState === s.key ? ' is-active' : ''}${dot ? ' has-dot' : ''}`,
                onClick: () => setActiveState(s.key),
              }, s.label);
            }),
          ),

          CSS_GROUPS.map((group) =>
            h(StyleGroup, {
              key: group.label,
              group,
              style: currentStyle,
              onSet: setStyle,
            }),
          ),

          hasStyles && h('div', { className: 'd-style-clear-row' },
            h('button', {
              className: 'd-insp-btn d-insp-btn-danger',
              onClick: clearAllStylesForState,
            }, h('i', { className: 'bi-trash' }), ` Clear ${activeState === 'normal' ? 'normal styles' : activeState}`),
          ),
        ),

    h('div', { className: 'd-inspector-actions' },
      h('button', { className: 'd-insp-btn', onClick: () => onMove(item.id, -1) },
        h('i', { className: 'bi-arrow-up' }), ' Move up'),
      h('button', { className: 'd-insp-btn', onClick: () => onMove(item.id, 1) },
        h('i', { className: 'bi-arrow-down' }), ' Move down'),
      h('button', { className: 'd-insp-btn', onClick: () => onDuplicate(item.id) },
        h('i', { className: 'bi-copy' }), ' Duplicate'),
      h('button', { className: 'd-insp-btn d-insp-btn-danger', onClick: () => onDelete(item.id) },
        h('i', { className: 'bi-trash' }), ' Remove'),
    ),
  );
}

// ── Prop editors ───────────────────────────────────────────────────────────

function PropEditor({ def, value, onChange }) {
  if (def.type === 'boolean') {
    return h('label', { className: 'd-prop-boolean' },
      h('input', { type: 'checkbox', checked: !!value, onChange: (e) => onChange(e.target.checked) }),
      h('span', null, value ? 'Yes' : 'No'),
    );
  }

  if (def.type === 'select') {
    return h('select', {
      className: 'd-prop-input',
      value: value ?? def.options[0],
      onChange: (e) => onChange(e.target.value),
    }, def.options.map((opt) => h('option', { key: opt, value: opt }, opt)));
  }

  if (def.type === 'number') {
    return h('div', { className: 'd-prop-number' },
      h('input', {
        type: 'range', className: 'd-prop-range',
        min: def.min ?? 0, max: def.max ?? 100, step: def.step ?? 1,
        value: value ?? def.min ?? 0,
        onInput: (e) => onChange(Number(e.target.value)),
      }),
      h('input', {
        type: 'number', className: 'd-prop-input d-prop-num-input',
        min: def.min, max: def.max, step: def.step ?? 1,
        value: value ?? def.min ?? 0,
        onInput: (e) => onChange(Number(e.target.value)),
      }),
    );
  }

  return h('input', {
    type: 'text', className: 'd-prop-input',
    value: value ?? '',
    onInput: (e) => onChange(e.target.value),
  });
}
