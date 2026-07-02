import { h, useState } from '/dist/nexa.js';

// Style editing UI for the Inspector's "Styles" tab: the collapsible
// property groups and the per-type value editors. Styled by Inspector.css
// (shares the .d-prop-* input classes with the Inspector's prop editors).

export const CSS_GROUPS = [
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
  { label: 'Subtle',  value: 'var(--m-shadow-1)' },
  { label: 'Medium',  value: 'var(--m-shadow-2)' },
  { label: 'Strong',  value: 'var(--m-shadow-3)' },
  { label: 'Colored', value: '0 4px 16px rgba(15,118,110,.35)' },
];

// ── Style group ────────────────────────────────────────────────────────────

export function StyleGroup({ group, style, onSet }) {
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
