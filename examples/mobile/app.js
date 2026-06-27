import { Fragment, h, render, useCallback, useState } from "../../dist/nexa.js";
import {
  AppBar,
  BottomNav,
  BottomSheet,
  Button,
  FAB,
  IconButton,
  ThemeToggle,
  Toast,
} from "../../dist/nexa-components.js";

import { HomeScreen }     from "./components/HomeScreen.js";
import { ExploreScreen }  from "./components/ExploreScreen.js";
import { ActivityScreen } from "./components/ActivityScreen.js";
import { ProfileScreen }  from "./components/ProfileScreen.js";

const TABS = [
  { value: "home",     label: "Home",     icon: "🏠" },
  { value: "explore",  label: "Explore",  icon: "🔍" },
  { value: "activity", label: "Activity", icon: "📊", badge: 3 },
  { value: "profile",  label: "Profile",  icon: "👤" },
];

const TITLES = {
  home:     "Nexa Mobile",
  explore:  "Explore",
  activity: "Activity",
  profile:  "Profile",
};

function App() {
  const [tab, setTab]     = useState("home");
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(false);

  const openSheet  = useCallback(() => setSheet(true), []);
  const closeSheet = useCallback(() => setSheet(false), []);

  const showToast = useCallback(() => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }, []);

  const screen =
    tab === "home"     ? h(HomeScreen,     { onOpenSheet: openSheet }) :
    tab === "explore"  ? h(ExploreScreen,  null) :
    tab === "activity" ? h(ActivityScreen, null) :
                         h(ProfileScreen,  null);

  return h(
    "div",
    { className: "m-app" },

    h(AppBar, {
      title: TITLES[tab],
      actions: h(
        Fragment,
        null,
        h(ThemeToggle, null),
        h(IconButton, { label: "Notification", onClick: showToast }, "🔔"),
      ),
    }),

    h("div", { className: "m-app-bar-offset" }),

    h("main", { className: "m-container mob-main" }, screen),

    h("div", { className: "m-bottom-nav-offset" }),

    h(BottomNav, { items: TABS, value: tab, onChange: setTab }),

    h(FAB, { label: "New action", aboveNav: true, onClick: openSheet }, "+"),

    h(BottomSheet, { open: sheet, title: "Available actions", onClose: closeSheet },
      h(
        "div",
        { className: "m-stack" },
        h(Button, { variant: "contained", className: "m-button-full", onClick: closeSheet }, "Confirm"),
        h(Button, { variant: "tonal",     className: "m-button-full", onClick: closeSheet }, "Cancel"),
      ),
    ),

    h(Toast, {
      open: toast,
      variant: "success",
      title: "Notification",
      message: "Everything working!",
      onClose: () => setToast(false),
    }),
  );
}

render(App, document.getElementById("app"));
