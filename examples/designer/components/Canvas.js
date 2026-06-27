import { h } from '/dist/nexa.js';
import { COMPONENT_MAP, CATALOG } from '../data.js';

const GRID = 24; // matches background dot grid

export function Canvas({ items, selectedId, onSelect, onDelete, onMove, onPositionUpdate }) {
  const isEmpty = items.length === 0;

  return h('div', {
    className: `d-canvas-area${isEmpty ? ' is-empty' : ''}`,
    onClick: () => onSelect(null),
  },
    isEmpty
      ? h('div', { className: 'd-canvas-empty' },
          h('i', { className: 'bi-cursor d-canvas-empty-icon' }),
          h('p', null, 'Click a component to add it'),
          h('p', { className: 'd-canvas-empty-sub' }, 'Drag by the header to reposition'),
        )
      : h('div', { className: 'd-canvas-grid' },
          items.map((item, idx) =>
            h(CanvasItem, {
              key: item.id,
              item, idx,
              total: items.length,
              selected: item.id === selectedId,
              onSelect, onDelete, onMove, onPositionUpdate,
            }),
          ),
        ),
  );
}

function CanvasItem({ item, idx, total, selected, onSelect, onDelete, onMove, onPositionUpdate }) {
  const Comp = COMPONENT_MAP[item.type];
  const { children, ...rest } = item.props;
  const styleProps = item.style && Object.keys(item.style).length > 0 ? { style: item.style } : {};
  const isWide = CATALOG.find((c) => c.name === item.type)?.wide ?? false;

  const preview = Comp
    ? h(Comp, { ...rest, ...styleProps, onChange: undefined, onClick: undefined }, children)
    : h('div', { className: 'd-canvas-unknown' }, `Unknown: ${item.type}`);

  return h('div', {
    className: `d-canvas-item${selected ? ' is-selected' : ''}${isWide ? ' d-canvas-item-wide' : ''}`,
    style: { left: `${item.x}px`, top: `${item.y}px` },
    dataset: { id: item.id },
    onClick: (e) => { e.stopPropagation(); onSelect(item.id); },
  },
    h('div', {
      className: 'd-canvas-item-bar',
      title: 'Drag to move • Alt = free (no snap)',
      onMouseDown: (e) => {
        if (e.target.closest('.d-action-btn')) return;
        startDrag(e, item, onPositionUpdate, onSelect);
      },
    },
      h('span', { className: 'd-canvas-item-type' },
        h('i', { className: 'bi-grip-horizontal d-drag-icon' }),
        h('i', { className: `${getCatalogIcon(item.type)} d-type-icon` }),
        item.type,
        h('span', { className: 'd-item-id' }, `#${item.id}`),
      ),
      h('div', { className: 'd-canvas-item-actions' },
        h('button', {
          className: 'd-action-btn',
          title: 'Bring to front',
          disabled: idx === total - 1,
          onClick: (e) => { e.stopPropagation(); onMove(item.id, 1); },
        }, h('i', { className: 'bi-layers' })),
        h('button', {
          className: 'd-action-btn',
          title: 'Send to back',
          disabled: idx === 0,
          onClick: (e) => { e.stopPropagation(); onMove(item.id, -1); },
        }, h('i', { className: 'bi-layers-half' })),
        h('button', {
          className: 'd-action-btn d-action-btn-danger',
          title: 'Remove',
          onClick: (e) => { e.stopPropagation(); onDelete(item.id); },
        }, h('i', { className: 'bi-trash' })),
      ),
    ),
    h('div', { className: 'd-canvas-item-preview' }, preview),
  );
}

function getCatalogIcon(type) {
  const entry = CATALOG.find((c) => c.name === type);
  return entry ? entry.icon : 'bi-box';
}

// ── Drag ──────────────────────────────────────────────────────────────────
// Uses transform:translate() during drag so Nexa VDOM re-renders
// (triggered by onSelect) never reset the imperative left/top mid-drag.
// Only left/top are committed to state on mouseup.

function snap(v) { return Math.round(v / GRID) * GRID; }

function startDrag(e, item, onPositionUpdate, onSelect) {
  if (e.button !== 0) return;
  e.preventDefault();

  const startX = e.clientX;
  const startY = e.clientY;
  const origX  = item.x;
  const origY  = item.y;
  let dragging = false;

  const itemEl = e.currentTarget.closest('.d-canvas-item');

  // Returns the snapped delta to apply as transform
  function delta(clientX, clientY, altKey) {
    const rawDx = clientX - startX;
    const rawDy = clientY - startY;
    if (altKey) return [rawDx, rawDy];
    return [snap(origX + rawDx) - origX, snap(origY + rawDy) - origY];
  }

  const onMove = (ev) => {
    const [dx, dy] = [ev.clientX - startX, ev.clientY - startY];
    if (!dragging && Math.sqrt(dx * dx + dy * dy) < 5) return;
    if (!dragging) { dragging = true; itemEl?.classList.add('is-dragging'); }

    const [tdx, tdy] = delta(ev.clientX, ev.clientY, ev.altKey);
    if (itemEl) itemEl.style.transform = `translate(${tdx}px,${tdy}px)`;
  };

  const onUp = (ev) => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);

    if (!dragging) {
      onSelect(item.id); // plain click → select
      return;
    }

    const [tdx, tdy] = delta(ev.clientX, ev.clientY, ev.altKey);
    const newX = Math.max(0, origX + tdx);
    const newY = Math.max(0, origY + tdy);

    // Imperatively clear transform + set final position BEFORE state commit
    // so there's no frame where left/top are stale while transform is ""
    if (itemEl) {
      itemEl.style.transform = '';
      itemEl.style.left = `${newX}px`;
      itemEl.style.top  = `${newY}px`;
      itemEl.classList.remove('is-dragging');
    }

    onSelect(item.id);
    onPositionUpdate(item.id, newX, newY);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}
