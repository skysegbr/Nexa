export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
];

export const FEATURES = [
  {
    id: "realtime",
    icon: "📊",
    title: "Real-time dashboards",
    description: "See what matters the moment it happens — no waiting for next-day reports.",
  },
  {
    id: "alerts",
    icon: "⚡",
    title: "Alerts that make sense",
    description: "Notifications only when something truly goes off pattern, with the right context to act immediately.",
  },
  {
    id: "integrations",
    icon: "🔌",
    title: "Native integrations",
    description: "Connect the tools your team already uses in a few clicks — no glue scripts.",
  },
  {
    id: "collaboration",
    icon: "💬",
    title: "In-context collaboration",
    description: "Comment directly on charts and bring the conversation to where the data actually lives.",
  },
  {
    id: "history",
    icon: "🕒",
    title: "Unlimited history",
    description: "Compare periods, discover trends, and understand the reason behind every change.",
  },
  {
    id: "security",
    icon: "🔒",
    title: "Real security",
    description: "Role-based access control and full audit log, from day one.",
  },
];

export const TESTIMONIALS = [
  {
    id: "marina",
    quote: "We replaced five spreadsheets with a single dashboard. The clarity completely changed how the team prioritizes work.",
    name: "Marina Alves",
    role: "Head of Product, Fluxo",
    initials: "MA",
  },
  {
    id: "diego",
    quote: "The alerts warned us of a conversion drop two hours before we would have noticed on our own. It paid for the year in one afternoon.",
    name: "Diego Tanaka",
    role: "Data Engineer, Vento",
    initials: "DT",
  },
  {
    id: "carla",
    quote: "Finally everyone looks at the same number. Meetings got shorter and, by far, more useful.",
    name: "Carla Nogueira",
    role: "COO, Aporte",
    initials: "CN",
  },
];

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small teams testing the waters",
    monthlyPrice: 0,
    annualPrice: 0,
    cta: "Start for free",
    features: [
      "Up to 3 dashboards",
      "1 integration",
      "7-day history",
      "Community support",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For teams that live by data",
    monthlyPrice: 79,
    annualPrice: 63,
    cta: "Subscribe to Team",
    highlighted: true,
    features: [
      "Unlimited dashboards",
      "Unlimited integrations",
      "90-day history",
      "Smart alerts",
      "Email and chat support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For operations that cannot stop",
    monthlyPrice: null,
    annualPrice: null,
    cta: "Talk to sales",
    features: [
      "Everything in Team",
      "SSO and SAML",
      "Unlimited history",
      "Dedicated support with SLA",
      "Full audit log",
    ],
  },
];

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Community", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];
