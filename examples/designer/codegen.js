// Code and CSS generation for canvas items — turns the designer's item
// objects back into copy-pasteable Nexa source and stylesheet rules.

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
