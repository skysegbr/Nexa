import { h, render } from "/dist/nexa.js";
import { NAV_LINKS, FEATURES, TESTIMONIALS, PLANS, FOOTER_COLUMNS } from "./data.js";
import { Header } from "./components/Header.js";
import { Hero } from "./components/Hero.js";
import { Features } from "./components/Features.js";
import { Testimonials } from "./components/Testimonials.js";
import { Pricing } from "./components/Pricing.js";
import { Footer } from "./components/Footer.js";

function App() {
  return h(
    "div",
    { className: "l-page" },
    h(Header, { navLinks: NAV_LINKS }),
    h(
      "main",
      null,
      h(Hero, null),
      h(Features, { features: FEATURES }),
      h(Testimonials, { testimonials: TESTIMONIALS }),
      h(Pricing, { plans: PLANS }),
      h(
        "section",
        { className: "l-cta" },
        h(
          "div",
          { className: "l-cta-inner" },
          h("h2", null, "Ready to stop guessing?"),
          h("p", null, "Create your account in under two minutes — no credit card, no commitment."),
          h("a", { className: "l-btn l-btn-primary l-btn-lg", href: "#pricing" }, "Create my account"),
        ),
      ),
    ),
    h(Footer, { columns: FOOTER_COLUMNS }),
  );
}

render(App, document.getElementById("app"));
