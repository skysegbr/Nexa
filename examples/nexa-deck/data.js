export const FRAMES = [
  {
    id: "abertura",
    x: 0,
    y: 0,
    w: 980,
    h: 610,
    rotate: 0,
    data: {
      kind: "title",
      eyebrow: "Nexa",
      heading: "Frontend direto no navegador",
      body: "Um framework JavaScript ESM-native, sem build, com componentes funcionais, hooks e add-ons visuais prontos para rodar via script type=\"module\".",
      meta: ["No-build", "Plain JavaScript", "React-like hooks"],
    },
  },
  {
    id: "browser",
    x: 1160,
    y: -180,
    w: 560,
    h: 600,
    rotate: -7,
    data: {
      kind: "point",
      eyebrow: "Ideia central",
      icon: "bi-browser-chrome",
      heading: "O browser e o ambiente de desenvolvimento",
      body: "Nexa importa modulos ESM diretamente do arquivo ou do CDN. Sem Vite, Babel, JSX, bundler ou etapa obrigatoria de npm install.",
      items: ["<script type=\"module\">", "CDN via jsDelivr", "Arquivos dist prontos para uso"],
    },
  },
  {
    id: "primitivas",
    x: 1910,
    y: 120,
    w: 580,
    h: 550,
    rotate: 5,
    data: {
      kind: "point",
      eyebrow: "Modelo mental",
      icon: "bi-diagram-3",
      heading: "Componentes, h() e render()",
      body: "Componentes sao funcoes JavaScript comuns. h() cria elementos virtuais e render() monta a aplicacao passando a funcao do componente raiz.",
      items: ["h('div', props, children)", "h(Component, props)", "render(App, container)"],
    },
  },
  {
    id: "regras",
    x: 1120,
    y: 610,
    w: 700,
    h: 630,
    rotate: -3,
    data: {
      kind: "rules",
      eyebrow: "Regras criticas",
      icon: "bi-exclamation-diamond",
      heading: "Tres detalhes evitam quase todos os tropeços",
      rules: [
        {
          tone: "danger",
          title: "Nao use render(h(App))",
          body: "render recebe a referencia da funcao: render(App, container).",
        },
        {
          tone: "warning",
          title: "Contexto nao usa Provider",
          body: "Como h(Component) executa imediatamente, use ctx.provide(value, fn).",
        },
        {
          tone: "success",
          title: "Listas precisam de key",
          body: "Itens sem key perdem estado e podem se comportar mal em re-render.",
        },
      ],
    },
  },
  {
    id: "hooks",
    x: 2050,
    y: 750,
    w: 610,
    h: 520,
    rotate: 4,
    data: {
      kind: "point",
      eyebrow: "Estado e efeitos",
      icon: "bi-sliders",
      heading: "Hooks familiares, sem compilacao",
      body: "A API cobre estado, efeitos, refs, memoizacao, reducer, formularios, fronteiras de erro, tema, design e recursos mobile.",
      items: ["useState, useEffect, useRef", "useMemo, useCallback, useReducer", "useForm, useTheme, useSwipe"],
    },
  },
  {
    id: "ui",
    x: 710,
    y: 1290,
    w: 640,
    h: 520,
    rotate: 6,
    data: {
      kind: "point",
      eyebrow: "Design system",
      icon: "bi-grid-1x2",
      heading: "Componentes e CSS ja empacotados",
      body: "nexa-components.js entrega uma biblioteca de UI sobre h(), e nexa-ui.css fornece grid, responsividade, dark mode e estilos mobile-first.",
      items: ["Button, Dialog, Drawer, Table", "FormField, Select, Tabs, Toast", "ThemeToggle, PaletteSwitcher, DesignSwitcher"],
    },
  },
  {
    id: "addons",
    x: 1540,
    y: 1450,
    w: 700,
    h: 520,
    rotate: -5,
    data: {
      kind: "point",
      eyebrow: "Add-ons",
      icon: "bi-node-plus",
      heading: "Canvas, Zoom e editor no mesmo pacote",
      body: "Alem do core, Nexa inclui extensoes para experiencias ricas sem build: editor de pipeline SVG, palco de zoom com camera animada e editor CodeMirror.",
      items: ["PipelineCanvasController", "ZoomStage", "FullCodeEditor + snippets"],
    },
  },
  {
    id: "codigo",
    x: 2520,
    y: 1370,
    w: 760,
    h: 540,
    rotate: 2,
    data: {
      kind: "code",
      eyebrow: "Entrada minima",
      heading: "Uma app Nexa cabe em poucos imports",
      body: "A pagina importa CSS, monta um container e executa um modulo ESM comum.",
      code: `import { h, render, useState } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components.js";

function App() {
  const [count, setCount] = useState(0);

  return h("section", { className: "m-page" },
    h("h1", null, "Nexa"),
    h(Button, {
      variant: "contained",
      onClick: () => setCount((v) => v + 1),
    }, \`Clicks: \${count}\`),
  );
}

render(App, document.getElementById("app"));`,
    },
  },
  {
    id: "visao-geral",
    x: -120,
    y: -300,
    w: 3550,
    h: 2600,
    rotate: 0,
    data: {
      kind: "overview",
      eyebrow: "Resumo",
      heading: "Nexa troca a cadeia de ferramentas por um caminho curto entre codigo e interface",
      columns: [
        {
          title: "Para criar",
          items: ["Funcoes como componentes", "h() como fabrica de vdom", "Hooks para estado e efeitos"],
        },
        {
          title: "Para rodar",
          items: ["ESM direto no navegador", "Arquivos /dist independentes", "CDN publico com versao pinavel"],
        },
        {
          title: "Para expandir",
          items: ["Biblioteca de componentes", "ZoomStage para apresentacoes", "Canvas e editor como add-ons"],
        },
      ],
    },
  },
];
