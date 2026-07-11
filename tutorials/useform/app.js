// Tutorial player: left = code for the current step, right = live useForm
// demo + state inspector, bottom = caption. The recording driver advances
// steps via window.__setStep(n).

import { h, render, useState, useForm } from "/dist/nexa.js";
import { TextField, Textarea, Button } from "/dist/nexa-components.js";

// ── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { // 0 — title card (overlay)
    title: "", code: "", caption: "",
  },
  {
    title: "1. O hook",
    code: `import { useForm } from "/dist/nexa.js";

function Cadastro() {
  const form = useForm({
    initialValues: { nome: "", email: "", notas: "" },
    validate,            // regras de validação
    // validateOnBlur: true  (padrão)
  });
  // form.values, form.errors, form.dirty, ...
}`,
    caption: "useForm concentra tudo num único hook: valores, erros, campos tocados e estado de envio. Sem dependências, sem build — direto no navegador.",
  },
  {
    title: "2. Conectando campos",
    code: `h(TextField, {
  id: "nome",
  label: "Nome",
  ...form.field("nome"),   // value + onChange + onBlur
}),

h(TextField, {
  id: "email",
  label: "E-mail",
  ...form.field("email"),
})`,
    caption: "field(\"nome\") devolve as props do campo — valor, onChange e onBlur. É só espalhar no componente. Repare no painel de estado: values e dirty reagem a cada tecla.",
  },
  {
    title: "3. Validação",
    code: `function validate(values) {
  return {
    nome:  values.nome.trim()          ? "" : "Informe o nome.",
    email: values.email.includes("@") &&
           values.email.includes(".")  ? "" : "E-mail inválido.",
    notas: values.notas.length >= 12   ? "" : "Mínimo de 12 caracteres.",
  };
}`,
    caption: "A função validate devolve um erro (ou string vazia) por campo. Com validateOnBlur, o erro aparece quando o campo perde o foco — nunca antes de o usuário interagir.",
  },
  {
    title: "4. Envio",
    code: `h("form", { onSubmit: form.handleSubmit() }, ...)

// no useForm:
async onSubmit(values, helpers) {
  await api.post("/cadastro", values);
  helpers.reset();     // limpa o formulário
}

// handleSubmit valida antes de chamar onSubmit:
// com erros, marca os campos e NÃO envia.`,
    caption: "handleSubmit previne o reload, valida tudo e só chama o seu onSubmit se o formulário estiver válido. Errou? Os campos ficam marcados e nada é enviado.",
  },
  { // 5 — recap card (overlay)
    title: "", code: "", caption: "",
  },
];

// ── tiny highlighter ─────────────────────────────────────────────────────────

// Built with new RegExp(string) instead of a regex literal: the repo's
// lightweight syntax validator balances brackets and would trip on the
// character classes inside a literal.
const TOKEN_RE = new RegExp(
  ["(\\/\\/[^\\n]*)",                                                    // comment
   "(\"(?:[^\"\\\\]|\\\\.)*\")",                                         // string
   "(\\b(?:import|from|function|const|return|async|await|new|if|true|false)\\b)", // keyword
   "([A-Za-z_$][\\w$]*)(?=\\()",                                         // fn call
  ].join("|"),
  "g",
);

function highlight(code) {
  // tokenize: comments, strings, keywords, function calls — everything else raw
  const tokens = [];
  const re = TOKEN_RE;
  re.lastIndex = 0;
  let last = 0, m;
  while ((m = re.exec(code))) {
    if (m.index > last) tokens.push(code.slice(last, m.index));
    if (m[1]) tokens.push(h("span", { className: "tut-cm" }, m[1]));
    else if (m[2]) tokens.push(h("span", { className: "tut-str" }, m[2]));
    else if (m[3]) tokens.push(h("span", { className: "tut-kw" }, m[3]));
    else tokens.push(h("span", { className: "tut-fn" }, m[4]));
    last = re.lastIndex;
  }
  if (last < code.length) tokens.push(code.slice(last));
  return tokens;
}

// ── validation (the real one used by the live form) ─────────────────────────

function validate(values) {
  return {
    nome: values.nome.trim() ? "" : "Informe o nome.",
    email: values.email.includes("@") && values.email.includes(".") ? "" : "E-mail inválido.",
    notas: values.notas.length >= 12 ? "" : "Mínimo de 12 caracteres.",
  };
}

// ── live demo form ───────────────────────────────────────────────────────────

function StatePanel({ form }) {
  const compact = (obj) =>
    JSON.stringify(obj, null, 1).replace(/\n\s*/g, " ").replace(/^{ | }$/g, "");
  return h("div", { className: "tut-state" },
    h("h4", null, "Estado do formulário (ao vivo)"),
    h("pre", null,
      "values:  { ", compact(form.values), " }\n",
      "errors:  { ", h("span", { className: "tut-err" }, compact(form.errors)), " }\n",
      "touched: { ", compact(form.touched), " }\n",
      "dirty: ", h("span", { className: form.dirty ? "tut-true" : "" }, String(form.dirty)),
      "   isValid: ", h("span", { className: form.isValid ? "tut-true" : "" }, String(form.isValid)),
      "   submitCount: ", String(form.submitCount),
    ),
  );
}

function Demo() {
  const [sent, setSent] = useState(false);
  const form = useForm({
    initialValues: { nome: "", email: "", notas: "" },
    validate,
    async onSubmit(values, helpers) {
      setSent(true);
      helpers.reset();
    },
  });

  return h("div", { className: "tut-demo" },
    h("div", { className: "tut-form-card" },
      h("h3", null, "Cadastro"),
      h("form", { onSubmit: form.handleSubmit() },
        h(TextField, { id: "nome", label: "Nome", ...form.field("nome") }),
        h(TextField, { id: "email", label: "E-mail", ...form.field("email") }),
        h(Textarea, { id: "notas", label: "Notas", rows: 2, ...form.field("notas", { type: "textarea" }) }),
        h(Button, { type: "submit", variant: "contained" }, "Enviar"),
      ),
      sent && h("div", { className: "tut-success" }, "✓ Cadastro enviado com sucesso!"),
    ),
    h(StatePanel, { form }),
  );
}

// ── player shell ─────────────────────────────────────────────────────────────

function App() {
  const [step, setStep] = useState(0);
  window.__setStep = setStep;
  const s = STEPS[step];

  return h("div", { className: "tut-root" },
    step === 0 && h("div", { className: "tut-overlay" },
      h("h1", null, "Formulários com ", h("em", null, "useForm")),
      h("p", null, "Nexa — framework frontend sem build, direto no navegador"),
    ),
    step === STEPS.length - 1 && h("div", { className: "tut-overlay" },
      h("h1", null, h("em", null, "useForm"), " — recapitulando"),
      h("ul", null,
        h("li", null, "initialValues + field() conectam os campos"),
        h("li", null, "validate() devolve um erro por campo"),
        h("li", null, "erros só aparecem depois da interação"),
        h("li", null, "handleSubmit valida e bloqueia envio inválido"),
        h("li", null, "dirty, touched e submitCount de graça"),
      ),
      h("p", null, "github.com/skysegbr/Nexa — docs/FORMS.md"),
    ),
    h("header", { className: "tut-header" },
      h("div", { className: "tut-brand" }, h("em", null, "Nexa"), " · Tutorial useForm"),
      h("div", { className: "tut-stepno" }, step > 0 && step < STEPS.length - 1 ? `passo ${step} de ${STEPS.length - 2}` : ""),
    ),
    h("main", { className: "tut-main" },
      h("section", { className: "tut-code" },
        h("h2", null, s.title),
        h("pre", null, ...highlight(s.code)),
      ),
      h(Demo, null),
    ),
    h("footer", { className: "tut-caption" }, s.caption),
  );
}

render(App, document.getElementById("app"));
