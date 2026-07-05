// Static data for the mobile demo screens.

export const FEATURES = [
  { id: 1, title: "Mobile Components", body: "Native AppBar, BottomNav, BottomSheet and FAB." },
  { id: 2, title: "Responsive Grid",   body: "12-column mobile-first grid, just like Bootstrap 5." },
  { id: 3, title: "Dark Mode",         body: "Automatic via prefers-color-scheme + manual toggle." },
  { id: 4, title: "Gesture Hooks",     body: "useSwipe, useLongPress, useVibrate and more." },
  { id: 5, title: "Safe Areas",        body: "Support for notch and Dynamic Island via env()." },
  { id: 6, title: "Touch Targets",     body: "Minimum 44px on all interactive elements." },
];

export const ACTIVITY_ITEMS = [
  { id: 1, text: "Mobile-first grid implemented",  time: "now" },
  { id: 2, text: "Automatic dark mode activated",  time: "2min" },
  { id: 3, text: "AppBar and BottomNav added",      time: "5min" },
  { id: 4, text: "useSwipe and useLongPress created", time: "10min" },
  { id: 5, text: "ThemeToggle with localStorage",  time: "15min" },
];

export const EXPLORE_FILTERS = ["all", "ui", "hooks", "css", "mobile"];

export const BREAKPOINTS = [
  { label: "sm >=576px", desc: "Small tablets" },
  { label: "md >=768px", desc: "Tablets" },
  { label: "lg >=992px", desc: "Desktop" },
  { label: "xl >=1200px", desc: "Wide desktop" },
];
