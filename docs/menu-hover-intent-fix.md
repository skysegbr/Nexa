# Hover-Intent do Menu — correção do submenu em cascata (0.24.2)

Por que o submenu fechava antes de o mouse alcançá-lo, e a correção em duas
partes (CSS + JS) — com o passo a passo para revisar aqui no FluxaWay e
portar para as cópias renomeadas (nexa, no code-editor).

## Estado atual

| Onde | Situação |
|---|---|
| **FluxaWay** | ✔ Correção aplicada no working tree (sem commit): fontes editadas, derivados regenerados, 410/410 testes passando em Chromium, Firefox e WebKit, CHANGELOG com a entrada 0.24.2. Falta revisar e commitar. |
| **FluxaBI** | ✔ Já re-vendorado (`fluxaway-components-overlay.js` + `fluxaway-ui.css`). |
| **code-editor** | ◌ Ainda com o bug: os mesmos padrões existem em `frontend/dist/nexa-components.js` e `nexa-ui.css`. Portar (seção 5). |

## 1. O sintoma e as duas causas

Pairar num item com filhos (ex.: **DB** no menu de Snippets) abre o flyout ao
lado — mas ao mover o ponteiro em direção a ele, o submenu some antes do
clique. São **dois bugs que se somam**:

```
┌─ lista raiz ─────┐  vão   ┌─ flyout ───────────┐
│  HTTP            │  2px   │  sqlite query      │
│ [DB           ›] │ ░░░░   │  postgres query    │
│  Data Sci     ›  │ ░░░░   │  mysql query       │
│  Reports         │        └────────────────────┘
└──────────────────┘
     ●╌╌╌╌╌╌╌ caminho diagonal do ponteiro ╌╌╌╌╌▶●
       (cruza o vão E passa sobre "Data Sci")
```

O flyout é filho do `<li>` do item. Então:

| Causa | Onde | Efeito |
|---|---|---|
| **Vão de 2px** (`margin-left: 2px` no flyout) | `fluxaway-ui.css` · `.m-menu-list-submenu` | Atravessar os 2px = sair do `<li>` → `mouseleave` → submenu desmonta antes de o ponteiro chegar. |
| **Fechamento/troca imediatos** (sem tolerância de hover) | `fluxaway-components-overlay.js` · `MenuItemNode` | No caminho diagonal, o irmão ("Data Sci") abre o próprio submenu no `mouseenter` e rouba a abertura na hora. |

## 2. Correção CSS — ponte invisível sobre o vão

Mantém o visual (os 2px continuam lá); só estende a área de hover do flyout
por cima do vão. Como o flyout é filho do `<li>`, o ponteiro nunca "sai" do
item durante a travessia.

`dist/fluxaway-ui.css`, logo após o bloco `.m-menu-list-submenu`:

```css
.m-menu-list-submenu {
  top: calc(var(--m-space-1) * -1);
  left: 100%;
  margin-left: 2px;
}

/* Ponte invisível sobre o vão de 2px entre o item e o flyout: sem ela o
   ponteiro "sai" do item ao cruzar e o submenu fecha antes de ser alcançado
   (o flyout é filho do <li>; a ponte mantém o hover dentro dele). */
.m-menu-list-submenu::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -8px;
  width: 8px;
}
```

## 3. Correção JS — hover-intent no MenuList

Um atraso único de 120 ms melhorava o caso, mas ainda falhava quando o
movimento diagonal levava mais tempo. A implementação final usa o teste de
inclinação conhecido como **menu aim**:

1. `MenuList` guarda as três posições mais recentes do ponteiro.
2. Ao entrar num irmão, compara a trajetória com os cantos esquerdo superior
   e inferior do flyout aberto.
3. Enquanto o ponteiro avança dentro desse corredor triangular, reavalia a
   intenção a cada 120 ms em vez de trocar o submenu.
4. Se o ponteiro parar sobre o irmão ou mudar de direção, o irmão abre sem
   uma espera longa arbitrária.

Itens folha também participam do hover-intent, para que atravessá-los no
caminho não feche o flyout. Teclado e clique continuam usando `openNow()` e
permanecem imediatos.

## 4. Regenerar, validar e commitar (FluxaWay)

Os `dist/*.js` e o `dist/fluxaway-ui.css` não-minificados **são a fonte**; o
resto é derivado — split primeiro, minify depois:

```bash
python3 scripts/split_css.py && python3 scripts/minify.py
python3 scripts/validate_fluxaway.py
python3 scripts/run_browser_tests.py --browser chromium   # 410/410 ok
```

Arquivos que a correção toca (já no working tree, prontos para revisão):

- `dist/fluxaway-components-overlay.js` (+ `.min.js`)
- `dist/fluxaway-ui.css`, `dist/fluxaway-ui-overlay.css` (+ `.min.css`)
- `CHANGELOG.md` (entrada 0.24.2)

Depois do commit/tag, re-vendorar nos apps = copiar
`fluxaway-components-overlay.js` e `fluxaway-ui.css` (o FluxaBI já está).

## 5. Porte para o code-editor (nexa)

A cópia renomeada tem os mesmos trechos. Âncoras de busca em
`frontend/dist/nexa-components.js`:

1. `grep -n "onMouseLeave: hasSubmenu"` → aplicar a seção 3.2;
2. `grep -n "function MenuList"` → aplicar a seção 3.1 (conferir se
   `useEffect` está no import do topo; adicionar se faltar);
3. no CSS (`nexa-ui.css`), `grep -n "m-menu-list-submenu"` → aplicar a ponte
   da seção 2 (as classes continuam `m-*`);
4. se houver `.min.*` derivados no code-editor, regenerar com os scripts de
   lá (ou re-copiar do FluxaWay pós-release, se a ideia for reconvergir as
   cópias).

## 6. Teste de aceitação

**Manual**: abrir um menu com submenus → pairar num item com filhos →
atravessar **devagar e na diagonal** até um item do flyout → clicar. Antes
da correção o flyout fecha no meio; depois, sobrevive à travessia e o clique
executa.

**Automatizado** (Playwright), o gesto equivalente:

```python
db = page.get_by_role("menuitem", name="DB")
box = db.bounding_box()
page.mouse.move(box["x"] + 40, box["y"] + box["height"] / 2, steps=8)
alvo = page.get_by_role("menuitem", name="postgres query").bounding_box()
page.mouse.move(alvo["x"] + 30, alvo["y"] + alvo["height"] / 2, steps=30)  # devagar
page.get_by_role("menuitem", name="postgres query").click()               # sobreviveu
```

Checar também o que **não** pode mudar: ArrowRight/ArrowLeft abrem e fecham
na hora, clique alterna na hora, e Escape/Tab fecham o menu todo (coberto
pelos 409 testes da suite).
