// Geometria (px no "mundo") + descritores de conteúdo — nenhuma chamada h() aqui.
// components/FrameContent.js converte cada descritor em vdom.
export const FRAMES = [
  {
    id: "capa",
    x: 0, y: 0, w: 1040, h: 640, rotate: 0,
    data: {
      kind: "cover",
      eyebrow: "Atlas do Nexa",
      heading: "Um framework JS sem build, mapeado quadro a quadro",
      body: "Cada território deste mapa é uma peça do Nexa — h(), hooks, componentes e os add-ons visuais — tudo rodando direto no navegador, sem bundler.",
      hint: "Use ← → ou clique no mapa para explorar",
      meta: ["ESM nativo", "Zero bundler", "API em hooks"],
    },
  },
  {
    id: "fundacao",
    x: 1260, y: -280, w: 600, h: 480, rotate: -7,
    data: {
      kind: "territory",
      eyebrow: "Território I · Fundação",
      icon: "bi-cloud",
      heading: "O navegador é o ambiente de build",
      body: "Nexa chega como três arquivos ESM prontos para importar. Um <script type=\"module\"> e a aplicação já está de pé — nada de Vite, Babel ou npm install.",
      items: [
        "dist/nexa.js — núcleo (h, render, hooks, contexto)",
        "dist/nexa-components.js — 39 componentes de UI",
        "dist/nexa-ui.css — tokens e design system",
      ],
    },
  },
  {
    id: "gramatica",
    x: 2020, y: 30, w: 700, h: 580, rotate: 5,
    data: {
      kind: "diagram",
      variant: "api",
      eyebrow: "Território II · Gramática",
      icon: "bi-diagram-3",
      heading: "h() desenha, render() planta a bandeira",
      intro: "h(type, props, ...children) cria um nó virtual. Quando type é uma função, ela roda IMEDIATAMENTE — a execução não é adiada para depois.",
      steps: [
        { code: "h('div', props, ...)", note: "elemento HTML comum" },
        { code: "h(Componente, props)", note: "executa a função agora, de olhos fechados" },
        { code: "render(App, container)", note: "referência da função — nunca h(App)" },
      ],
      warning: "render(h(App), el) explode com “App can only be used during rendering”.",
    },
  },
  {
    id: "estreito",
    x: 2860, y: -220, w: 760, h: 640, rotate: -4,
    data: {
      kind: "diagram",
      variant: "context",
      eyebrow: "Território III · O Estreito do Contexto",
      icon: "bi-signpost-2",
      heading: "Não existe <Provider>. E tem um motivo geográfico.",
      intro: "h(Filho) já foi executado antes do corpo do provider sequer começar — não há como “segurar” esse valor depois. A travessia certa: construir a subárvore DENTRO do próprio thunk.",
      wrongLabel: "Rota que afunda",
      wrongCode: "ThemeCtx.provide(v, () => children)\n// children já rodou antes daqui",
      rightLabel: "Rota que atravessa",
      rightCode: "ThemeCtx.provide(v, () =>\n  h(App, null)\n)",
    },
  },
  {
    id: "bussola",
    x: 2520, y: 560, w: 780, h: 640, rotate: 3,
    data: {
      kind: "rules",
      eyebrow: "Três marcos que evitam quase todo naufrágio",
      heading: "A bússola de regras críticas",
      rules: [
        { dir: "N", tone: "danger", icon: "bi-x-octagon", title: "render(App, el)", body: "Nunca render(h(App), el) — passe a referência da função, não o resultado da chamada." },
        { dir: "L", tone: "warning", icon: "bi-signpost-2", title: "Sem componente Provider", body: "Use ctx.provide(valor, () => ...) — mesmo um Provider que só recebe children não funciona." },
        { dir: "S", tone: "success", icon: "bi-check2-circle", title: "key em toda lista", body: "Sem key, itens de lista perdem estado e se comportam mal em re-render." },
      ],
    },
  },
  {
    id: "arquipelago",
    x: 1580, y: 720, w: 820, h: 600, rotate: -5,
    data: {
      kind: "hooks",
      eyebrow: "Território IV · O Arquipélago de Hooks",
      heading: "31 hooks exportados por dist/nexa.js",
      caption: "Do estado básico ao WebSocket com reconexão automática — sem uma linha de compilação.",
      words: [
        { text: "useState", size: "xl" }, { text: "useEffect", size: "xl" },
        { text: "useRef", size: "lg" }, { text: "useMemo", size: "lg" },
        { text: "useCallback", size: "lg" }, { text: "useReducer", size: "md" },
        { text: "useContext", size: "lg" }, { text: "useForm", size: "xl" },
        { text: "useErrorBoundary", size: "sm" }, { text: "useLocalStorage", size: "md" },
        { text: "useFetch", size: "md" }, { text: "useToast", size: "md" },
        { text: "useRouter", size: "lg" }, { text: "useTheme", size: "md" },
        { text: "usePalette", size: "sm" }, { text: "useDesign", size: "sm" },
        { text: "useSwipe", size: "sm" }, { text: "useLongPress", size: "sm" },
        { text: "useNetworkStatus", size: "sm" }, { text: "useOrientation", size: "sm" },
        { text: "useVibrate", size: "sm" }, { text: "useHistory", size: "md" },
        { text: "useId", size: "md" }, { text: "useDebounce", size: "md" },
        { text: "useThrottle", size: "sm" }, { text: "useMediaQuery", size: "md" },
        { text: "useIntersectionObserver", size: "sm" }, { text: "useWebSocket", size: "md" },
        { text: "useVirtualList", size: "sm" }, { text: "useTranslation", size: "sm" },
        { text: "useContextMenu", size: "sm" },
      ],
    },
  },
  {
    id: "farol-vivo",
    x: 660, y: 820, w: 860, h: 640, rotate: 4,
    data: {
      kind: "live",
      eyebrow: "Território V · O Farol Vivo",
      heading: "Este quadro não é uma captura de tela",
      body: "É Button, Switch, TextField e Progress de verdade — renderizados agora, dentro da própria apresentação que você está navegando.",
    },
  },
  {
    id: "recife",
    x: -320, y: 940, w: 680, h: 580, rotate: -3,
    data: {
      kind: "tokens",
      eyebrow: "Território VI · O Recife de Tokens",
      heading: "Cores e espaçamento vivem em variáveis CSS",
      caption: "Tudo em --m-*, herdado de dist/nexa-ui.css — sobrescreva no :root ou por escopo local.",
      swatches: [
        { name: "primary", varName: "--m-primary" },
        { name: "secondary", varName: "--m-secondary" },
        { name: "success", varName: "--m-success" },
        { name: "warning", varName: "--m-warning" },
        { name: "danger", varName: "--m-danger" },
        { name: "info", varName: "--m-info" },
      ],
      spacing: ["--m-space-1", "--m-space-2", "--m-space-3", "--m-space-4", "--m-space-6", "--m-space-8", "--m-space-12"],
    },
  },
  {
    id: "ilhas",
    x: -420, y: -420, w: 740, h: 560, rotate: 6,
    data: {
      kind: "addons",
      eyebrow: "Território VII · As Ilhas de Add-on",
      heading: "Três extensões, fora do núcleo, no mesmo arquipélago",
      addons: [
        { icon: "bi-diagram-3", name: "PipelineCanvas", desc: "editor SVG de nós e conexões — drag, zoom, mini-mapa, undo/redo." },
        { icon: "bi-compass", name: "PreziStage", desc: "câmera animada sobre um canvas gigante — é exatamente o motor deste atlas.", wink: true },
        { icon: "bi-code-slash", name: "FullCodeEditor", desc: "CodeMirror com toolbar, snippets e troca de linguagem." },
      ],
    },
  },
  {
    id: "posto-avancado",
    x: 380, y: -740, w: 700, h: 580, rotate: -4,
    data: {
      kind: "filetree",
      eyebrow: "Território VIII · O Posto Avançado",
      heading: "A estrutura domain-componentized",
      caption: "app.js só orquestra. data.js só guarda dados. Cada domínio cuida do seu próprio contexto.",
      tree: [
        { depth: 0, label: "app.js", note: "orquestrador" },
        { depth: 0, label: "data.js", note: "dados em UPPER_CASE" },
        { depth: 0, label: "styles.css", note: "@import central" },
        { depth: 0, label: "components/" },
        { depth: 1, label: "cart/CartContext.js", note: "contexto + estado" },
        { depth: 1, label: "cart/CartButton.js" },
        { depth: 1, label: "auth/AuthContext.js" },
        { depth: 1, label: "auth/AuthMenu.js" },
      ],
    },
  },
  {
    id: "cartografia",
    x: 1260, y: -880, w: 760, h: 600, rotate: 3,
    data: {
      kind: "code",
      eyebrow: "Território IX · A Prancheta do Cartógrafo",
      heading: "Uma app Nexa inteira cabe numa prancheta",
      body: "Sem etapa de build entre este código e o navegador — o módulo roda como está.",
      code: `import { h, render, useState } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components.js";

function App() {
  const [count, setCount] = useState(0);

  return h("section", { className: "m-page" },
    h("h1", null, "Nexa"),
    h(Button, {
      variant: "contained",
      onClick: () => setCount((v) => v + 1),
    }, \`Cliques: \${count}\`),
  );
}

render(App, document.getElementById("app"));`,
    },
  },
  {
    id: "marcos",
    x: 2140, y: -740, w: 700, h: 480, rotate: -5,
    data: {
      kind: "stats",
      eyebrow: "Território X · Os Marcos",
      heading: "O tamanho da viagem, em números",
      stats: [
        { value: "0", label: "etapas de build" },
        { value: "39", label: "componentes de UI" },
        { value: "31", label: "hooks exportados" },
        { value: "3", label: "arquivos-núcleo" },
        { value: "1", label: "<script type=\"module\">" },
      ],
    },
  },
  {
    id: "mapa-mundi",
    x: -600, y: -980, w: 4760, h: 2680, rotate: 0,
    data: {
      kind: "overview",
      eyebrow: "O Atlas completo",
      heading: "Dez territórios, um único caminho até a interface",
      legend: [
        {
          title: "Para criar",
          items: ["Componentes são funções comuns", "h() fabrica nós virtuais", "Hooks cuidam de estado e efeitos"],
        },
        {
          title: "Para navegar",
          items: ["render(App, container) planta a bandeira", "ctx.provide() substitui o <Provider>", "key mantém a memória das listas"],
        },
        {
          title: "Para expandir",
          items: ["39 componentes prontos em nexa-components.js", "Canvas, Prezi e editor como add-ons", "Tudo sobre os mesmos tokens --m-*"],
        },
      ],
    },
  },
  {
    id: "novo-horizonte",
    x: 3260, y: 420, w: 780, h: 580, rotate: 5,
    data: {
      kind: "cta",
      eyebrow: "Fim do mapa, início da expedição",
      heading: "O horizonte é só um <script type=\"module\"> de distância",
      body: "Aponte para os arquivos dist/ locais ou fixe uma tag de versão do CDN — e comece a desenhar o seu próprio território.",
      code: `<link rel="stylesheet" href="/dist/nexa-ui.css">
<script type="module" src="./app.js"></script>`,
      cdn: "cdn.jsdelivr.net/gh/skysegbr/Nexa@main/dist/nexa.js",
    },
  },
];
