import { h, render, useState, useEffect, useCallback, useToast, useContextMenu, useHistory } from "/dist/nexa.js";
import { ContextMenu, ToastStack } from "/dist/nexa-components.js";
import { PipelineCanvas }          from "/dist/nexa-canvas.js";
import { COLORS, INITIAL, consumeNextId, topoSort, exportJSON, importJSON } from "./data.js";
import { CanvasToolbar }   from "./components/CanvasToolbar.js";
import { CanvasHints }     from "./components/CanvasHints.js";
import { NodeEditDialog }  from "./components/NodeEditDialog.js";

function App() {
  const { state: nodes, set: setNodes, undo, redo, canUndo, canRedo } = useHistory(INITIAL);
  const { toasts, toast }             = useToast();
  const { menu, openMenu, closeMenu } = useContextMenu();
  const [ctxId,    setCtxId]    = useState(null);
  const [editNode, setEditNode] = useState(null);
  const [running,  setRunning]  = useState(false);

  // Ctrl+Z / Ctrl+Y — skip when focus is inside an input
  useEffect(() => {
    const handler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "z" || e.key === "Z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if (e.key === "y" || e.key === "Y") { e.preventDefault(); redo(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const update = (id, patch) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));

  const remove = (id) =>
    setNodes(prev =>
      prev.filter(n => n.id !== id)
          .map(n => ({ ...n, deps: (n.deps || []).filter(d => d !== id) }))
    );

  const addNode = () => {
    const id = consumeNextId();
    setNodes(prev => [...prev, {
      id, label: `Step ${id}`, body: "", language: "python",
      x: 120 + Math.random() * 300, y: 140 + Math.random() * 200,
      color: COLORS[id % COLORS.length], status: "idle", deps: [],
    }]);
    toast.success(`Node "${id}" added.`);
  };

  const runAll = () => {
    if (running) return;
    setRunning(true);
    setNodes(prev => prev.map(n => ({ ...n, status: "idle" })));
    toast.info("Running pipeline...");
    const order = topoSort(nodes);
    order.forEach((id, i) => {
      setTimeout(() => update(id, { status: "running" }),  i * 600);
      setTimeout(() => {
        update(id, { status: "success" });
        if (i === order.length - 1) { setRunning(false); toast.success("Pipeline complete!"); }
      }, i * 600 + 500);
    });
  };

  const stopAll = () => {
    setRunning(false);
    setNodes(prev => prev.map(n => n.status === "running" ? { ...n, status: "idle" } : n));
    toast.warning("Pipeline stopped.");
  };

  const handleConnect = (fromId, toId) => {
    const target = nodes.find(n => n.id === toId);
    if (!target || (target.deps || []).some(d => String(d) === String(fromId))) return;
    update(toId, { deps: [...(target.deps || []), fromId] });
    toast.success("Connection created.");
  };

  const handleConnectionDelete = (fromId, toId) => {
    setNodes(prev => prev.map(n =>
      n.id === toId ? { ...n, deps: (n.deps || []).filter(d => String(d) !== String(fromId)) } : n
    ));
    toast.info("Connection removed.");
  };

  const handleContextMenu = (nodeId, x, y) => {
    setCtxId(nodeId);
    openMenu({ clientX: x, clientY: y, preventDefault: () => {} });
  };

  const handleImport = () =>
    importJSON()
      .then(data => { setNodes(data); toast.success("Pipeline loaded!"); })
      .catch(err  => toast.error(err.message));

  // Stable refs prevent Dialog from stealing focus on every keystroke
  const handleEditClose = useCallback(() => setEditNode(null), []);
  const handleEditSave  = useCallback((updated) => { update(updated.id, updated); toast.success("Node saved."); }, []);

  const ctxItems = [
    { label: "Edit",             icon: h("i", { className: "bi bi-pencil"       }), onClick: () => { setEditNode(nodes.find(n => n.id === ctxId)); closeMenu(); } },
    { label: "Mark successful",  icon: h("i", { className: "bi bi-check-circle"  }), onClick: () => { update(ctxId, { status: "success" }); closeMenu(); } },
    { label: "Mark running",     icon: h("i", { className: "bi bi-play-circle"   }), onClick: () => { update(ctxId, { status: "running" }); closeMenu(); } },
    { label: "Mark failed",      icon: h("i", { className: "bi bi-x-circle"      }), danger: true, onClick: () => { update(ctxId, { status: "error"   }); closeMenu(); } },
    { divider: true },
    { label: "Remove node",      icon: h("i", { className: "bi bi-trash"         }), danger: true, onClick: () => { remove(ctxId); closeMenu(); toast.info("Node removed."); } },
  ];

  return h("div", { className: "canvas-app" },

    h(CanvasToolbar, {
      nodes, running, canUndo, canRedo,
      onAdd:    addNode,
      onRun:    runAll,
      onStop:   stopAll,
      onUndo:   undo,
      onRedo:   redo,
      onExport: () => exportJSON(nodes),
      onImport: handleImport,
    }),

    h(PipelineCanvas, {
      nodes,
      style:              "flex:1",
      onNodeMove:         (id, x, y) => update(id, { x, y }),
      onNodeDelete:       (id)       => { remove(id); toast.info("Node removed."); },
      onNodeEdit:         (id)       => setEditNode(nodes.find(n => n.id === id)),
      onNodeConnect:      handleConnect,
      onConnectionDelete: handleConnectionDelete,
      onContextMenu:      handleContextMenu,
    }),

    h(NodeEditDialog, {
      node:    editNode,
      onSave:  handleEditSave,
      onClose: handleEditClose,
    }),

    h(ContextMenu, { open: menu.open, x: menu.x, y: menu.y, onClose: closeMenu, items: ctxItems }),
    h(ToastStack,  { toasts, onClose: (id) => toast.dismiss(id) }),

    h(CanvasHints),
  );
}

render(App, document.getElementById("app"));
