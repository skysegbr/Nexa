import { h, useState } from '/dist/nexa.js';
import { CATALOG } from '../data.js';

const CSS_GROUPS = [
  {
    label: 'Colors',
    icon: 'bi-palette',
    props: [
      { key: 'color',           label: 'Text color',       type: 'color' },
      { key: 'backgroundColor', label: 'Background',       type: 'color' },
      { key: 'borderColor',     label: 'Border color',     type: 'color' },
    ],
  },
  {
    label: 'Border',
    icon: 'bi-border-width',
    props: [
      { key: 'borderWidth',  label: 'Width',  type: 'px-range', min: 0, max: 16 },
      { key: 'borderStyle',  label: 'Style',  type: 'select', options: ['solid', 'dashed', 'dotted', 'double', 'none'] },
      { key: 'borderRadius', label: 'Radius', type: 'px-range', min: 0, max: 64 },
    ],
  },
  {
    label: 'Spacing',
    icon: 'bi-arrows-angle-expand',
    props: [
      { key: 'padding',       label: 'Padding',        type: 'px-input' },
      { key: 'paddingTop',    label: 'Padding top',    type: 'px-range', min: 0, max: 64 },
      { key: 'paddingRight',  label: 'Padding right',  type: 'px-range', min: 0, max: 64 },
      { key: 'paddingBottom', label: 'Padding bottom', type: 'px-range', min: 0, max: 64 },
      { key: 'paddingLeft',   label: 'Padding left',   type: 'px-range', min: 0, max: 64 },
    ],
  },
  {
    label: 'Typography',
    icon: 'bi-type',
    props: [
      { key: 'fontSize',   label: 'Size',      type: 'px-range', min: 10, max: 48 },
      { key: 'fontWeight', label: 'Weight',    type: 'select', options: ['normal', 'bold', '300', '400', '500', '600', '700', '800'] },
      { key: 'textAlign',  label: 'Alignment', type: 'select', options: ['left', 'center', 'right', 'justify'] },
      { key: 'letterSpacing', label: 'Letter spacing', type: 'px-input' },
      { key: 'lineHeight',    label: 'Line height',    type: 'px-input' },
    ],
  },
  {
    label: 'Dimensions',
    icon: 'bi-aspect-ratio',
    props: [
      { key: 'width',    label: 'Width',     type: 'px-input' },
      { key: 'height',   label: 'Height',    type: 'px-input' },
      { key: 'minWidth', label: 'Min-width', type: 'px-input' },
      { key: 'maxWidth', label: 'Max-width', type: 'px-input' },
    ],
  },
  {
    label: 'Effects',
    icon: 'bi-stars',
    props: [
      { key: 'opacity',    label: 'Opacity',        type: 'float-range', min: 0, max: 1, step: 0.05 },
      { key: 'boxShadow',  label: 'Shadow',         type: 'shadow-select' },
      { key: 'transition', label: 'CSS transition', type: 'px-input' },
    ],
  },
];

const SHADOW_OPTIONS = [
  { label: 'None',    value: 'none' },
  { label: 'Soft',    value: '0 1px 3px rgba(0,0,0,.12)' },
  { label: 'Medium',  value: '0 4px 12px rgba(0,0,0,.15)' },
  { label: 'Strong',  value: '0 8px 24px rgba(0,0,0,.2)' },
  { label: 'Colored', value: '0 4px 16px rgba(15,118,110,.35)' },
];

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

// ── Style group ────────────────────────────────────────────────────────────

function StyleGroup({ group, style, onSet }) {
  const [open, setOpen] = useState(true);
  const activeCount = group.props.filter((p) => style[p.key]).length;

  return h('div', { className: 'd-style-group' },
    h('button', {
      className: 'd-style-group-head',
      onClick: () => setOpen((v) => !v),
    },
      h('i', { className: group.icon }),
      h('span', null, group.label),
      activeCount > 0 && h('span', { className: 'd-group-count' }, activeCount),
      h('i', { className: `bi-chevron-${open ? 'up' : 'down'} d-group-chevron` }),
    ),
    open && h('div', { className: 'd-style-group-body' },
      group.props.map((def) =>
        h(StyleEditor, { key: def.key, def, value: style[def.key], onSet }),
      ),
    ),
  );
}

// ── Individual style editors ───────────────────────────────────────────────

function StyleEditor({ def, value, onSet }) {
  if (def.type === 'color') return h(ColorEditor, { def, value, onSet });
  if (def.type === 'px-range') return h(PxRangeEditor, { def, value, onSet });
  if (def.type === 'float-range') return h(FloatRangeEditor, { def, value, onSet });
  if (def.type === 'shadow-select') return h(ShadowSelect, { def, value, onSet });

  // px-input or fallback text
  const isSet = value !== undefined && value !== null && value !== '';
  return h('div', { className: 'd-style-row' },
    h('label', { className: 'd-style-label' }, def.label),
    h('div', { className: 'd-style-field' },
      h('input', {
        type: 'text', className: `d-prop-input${isSet ? ' is-set' : ''}`,
        value: value ?? '',
        placeholder: 'ex: 8px, 1rem',
        onInput: (e) => onSet(def.key, e.target.value || null),
      }),
      isSet && h('button', { className: 'd-clear-btn', onClick: () => onSet(def.key, null), title: 'Remove' }, '×'),
    ),
  );
}

function ColorEditor({ def, value, onSet }) {
  const displayVal = value || '';
  const isSet = !!value;

  return h('div', { className: 'd-style-row' },
    h('label', { className: 'd-style-label' }, def.label),
    h('div', { className: 'd-color-row' },
      h('div', { className: 'd-color-swatch', style: { background: value || 'transparent' } }),
      h('input', {
        type: 'color',
        className: 'd-color-picker',
        value: toHex(value),
        onInput: (e) => onSet(def.key, e.target.value),
      }),
      h('input', {
        type: 'text',
        className: `d-prop-input d-color-text${isSet ? ' is-set' : ''}`,
        value: displayVal,
        placeholder: '#000 / rgb()',
        onInput: (e) => onSet(def.key, e.target.value || null),
      }),
      isSet && h('button', { className: 'd-clear-btn', onClick: () => onSet(def.key, null), title: 'Remove' }, '×'),
    ),
  );
}

function PxRangeEditor({ def, value, onSet }) {
  const num = value ? parseInt(value, 10) : 0;
  const isSet = !!value;

  return h('div', { className: 'd-style-row' },
    h('label', { className: 'd-style-label' }, def.label),
    h('div', { className: 'd-px-row' },
      h('input', {
        type: 'range', className: 'd-prop-range',
        min: def.min ?? 0, max: def.max ?? 50, step: 1,
        value: num,
        onInput: (e) => {
          const v = Number(e.target.value);
          onSet(def.key, v === 0 ? null : `${v}px`);
        },
      }),
      h('span', { className: `d-px-val${isSet ? ' is-set' : ''}` }, `${num}px`),
      isSet && h('button', { className: 'd-clear-btn', onClick: () => onSet(def.key, null), title: 'Remove' }, '×'),
    ),
  );
}

function FloatRangeEditor({ def, value, onSet }) {
  const num = value !== undefined && value !== null ? Number(value) : 1;
  const isSet = value !== undefined && value !== null;

  return h('div', { className: 'd-style-row' },
    h('label', { className: 'd-style-label' }, def.label),
    h('div', { className: 'd-px-row' },
      h('input', {
        type: 'range', className: 'd-prop-range',
        min: def.min ?? 0, max: def.max ?? 1, step: def.step ?? 0.05,
        value: num,
        onInput: (e) => {
          const v = parseFloat(e.target.value);
          onSet(def.key, v === 1 ? null : v);
        },
      }),
      h('span', { className: `d-px-val${isSet ? ' is-set' : ''}` }, num.toFixed(2)),
      isSet && h('button', { className: 'd-clear-btn', onClick: () => onSet(def.key, null), title: 'Remove' }, '×'),
    ),
  );
}

function ShadowSelect({ def, value, onSet }) {
  const isSet = !!value && value !== 'none';

  return h('div', { className: 'd-style-row' },
    h('label', { className: 'd-style-label' }, def.label),
    h('div', { className: 'd-style-field' },
      h('select', {
        className: `d-prop-input${isSet ? ' is-set' : ''}`,
        value: value ?? 'none',
        onChange: (e) => onSet(def.key, e.target.value === 'none' ? null : e.target.value),
      },
        SHADOW_OPTIONS.map((opt) => h('option', { key: opt.value, value: opt.value }, opt.label)),
      ),
    ),
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#') && (color.length === 4 || color.length === 7)) return color;
  return '#000000';
}
