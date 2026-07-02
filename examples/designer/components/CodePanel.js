import { h, useState } from '/dist/nexa.js';
import { generateCode, generateItemCode, generateCSSCode } from '../codegen.js';

export function CodePanel({ items, selectedId }) {
  const [tab, setTab] = useState('all');
  const [copied, setCopied] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedId);

  const code = tab === 'css'
    ? generateCSSCode(items)
    : tab === 'all'
      ? generateCode(items)
      : selectedItem
        ? generateItemCode(selectedItem)
        : '// No component selected.';

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return h('div', { className: 'd-code-panel' },
    h('div', { className: 'd-code-header' },
      h('div', { className: 'd-code-tabs' },
        h('button', {
          className: `d-code-tab${tab === 'all' ? ' is-active' : ''}`,
          onClick: () => setTab('all'),
        }, 'JS - all'),
        h('button', {
          className: `d-code-tab${tab === 'selected' ? ' is-active' : ''}`,
          onClick: () => setTab('selected'),
          disabled: !selectedItem,
        }, 'JS - selected'),
        h('button', {
          className: `d-code-tab${tab === 'css' ? ' is-active' : ''}`,
          onClick: () => setTab('css'),
        }, 'CSS - states'),
      ),
      h('button', { className: 'd-copy-btn', onClick: copy },
        h('i', { className: copied ? 'bi-check2' : 'bi-clipboard' }),
        copied ? ' Copied!' : ' Copy',
      ),
    ),
    h('pre', { className: 'd-code-pre' }, code),
  );
}
