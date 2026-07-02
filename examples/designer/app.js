import { h, render, useState, useEffect } from '/dist/nexa.js';
import { createItem, CATALOG } from './data.js';
import { generatePreviewCSS } from './codegen.js';
import { Palette } from './components/Palette.js';
import { Canvas } from './components/Canvas.js';
import { Inspector } from './components/Inspector.js';
import { CodePanel } from './components/CodePanel.js';

function App() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  function addItem(entry) {
    const item = createItem(entry);
    setItems((prev) => [...prev, item]);
    setSelectedId(item.id);
  }

  function updateItemProps(id, newProps) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, props: newProps } : i)));
  }

  function updateItemStyle(id, newStyle) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, style: newStyle } : i)));
  }

  function updateItemPosition(id, x, y) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, x, y } : i)));
  }

  function updateItemState(id, stateName, styleObj) {
    setItems((prev) => prev.map((i) =>
      i.id === id ? { ...i, states: { ...i.states, [stateName]: styleObj } } : i,
    ));
  }

  // Inject pseudo-class CSS into <head> so hover/focus/active work in preview
  useEffect(() => {
    let el = document.getElementById('d-designer-states');
    if (!el) {
      el = document.createElement('style');
      el.id = 'd-designer-states';
      document.head.appendChild(el);
    }
    el.textContent = items.map(generatePreviewCSS).join('\n');
  }, [items]);

  function deleteItem(id) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  }

  function moveItem(id, dir) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  function duplicateItem(id) {
    setItems((prev) => {
      const src = prev.find((i) => i.id === id);
      if (!src) return prev;
      const entry = CATALOG.find((c) => c.name === src.type);
      const copy = createItem(entry || { name: src.type, defaultProps: {} });
      copy.props = { ...src.props };
      const idx = prev.findIndex((i) => i.id === id);
      const arr = [...prev];
      arr.splice(idx + 1, 0, copy);
      setSelectedId(copy.id);
      return arr;
    });
  }

  function clearCanvas() {
    if (items.length > 0 && confirm('Clear the canvas? All components will be removed.')) {
      setItems([]);
      setSelectedId(null);
    }
  }

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  return h('div', { className: 'd-app' },

    h('header', { className: 'd-header' },
      h('div', { className: 'd-header-brand' },
        h('span', { className: 'd-logo' }, 'Nexa'),
        h('span', { className: 'd-logo-sub' }, 'Designer'),
      ),
      h('div', { className: 'd-header-actions' },
        items.length > 0 && h('button', {
          className: 'd-header-btn',
          onClick: clearCanvas,
        }, h('i', { className: 'bi-trash' }), ' Clear'),
      ),
    ),

    h('div', { className: 'd-main' },
      h(Palette, { onAdd: addItem }),

      h(Canvas, {
        items,
        selectedId,
        onSelect: setSelectedId,
        onDelete: deleteItem,
        onMove: moveItem,
        onPositionUpdate: updateItemPosition,
      }),

      h(Inspector, {
        item: selectedItem,
        onUpdate: updateItemProps,
        onStyleUpdate: updateItemStyle,
        onStateUpdate: updateItemState,
        onDelete: deleteItem,
        onMove: moveItem,
        onDuplicate: duplicateItem,
      }),
    ),

    h(CodePanel, { items, selectedId }),
  );
}

render(App, document.getElementById('app'));
