import {
  h,
  render,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "/dist/nexa.js";
import { CoreHeader }  from "./components/CoreHeader.js";
import { CoreMeter }   from "./components/CoreMeter.js";
import { CoreToolbar } from "./components/CoreToolbar.js";
import { ModuleList }  from "./components/ModuleList.js";

const modules = [
  { id: "fragment", title: "Fragment",   description: "Multiple elements without an extra wrapper." },
  { id: "refs",     title: "Refs",       description: "Direct and controlled access to the DOM." },
  { id: "memo",     title: "Memo",       description: "Derived computations without unnecessary recalculation." },
  { id: "effects",  title: "Effects",    description: "Effects with cleanup on change or unmount." },
  { id: "keys",     title: "Keys",       description: "Dynamic lists preserve visual identity." },
  { id: "props",    title: "DOM props",  description: "style, dataset and booleans are more predictable." },
];

function App() {
  const [query, setQuery]     = useState("");
  const [reverse, setReverse] = useState(false);
  const [width, setWidth]     = useState(window.innerWidth);
  const inputRef = useRef(null);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const visibleModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = modules.filter((m) =>
      `${m.title} ${m.description}`.toLowerCase().includes(q),
    );
    return reverse ? [...filtered].reverse() : filtered;
  }, [query, reverse]);

  const clearSearch = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  return h(
    "section",
    {
      className: "m-page core-page",
      dataset: { example: "core", state: reverse ? "reversed" : "normal" },
    },
    h(CoreHeader),
    h(CoreToolbar, { inputRef, query, setQuery, reverse, setReverse, clearSearch }),
    h(CoreMeter, { reverse, total: visibleModules.length, width }),
    h(ModuleList, { modules: visibleModules }),
  );
}

render(App, document.getElementById("app"));
