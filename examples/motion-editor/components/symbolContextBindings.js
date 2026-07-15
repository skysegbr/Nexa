// Selection/playhead coordination around MovieClip context navigation.

import { createResetAfter } from "./contextReset.js";

export function symbolContextBindings({ editor, layers, setActorSelection, playheadRef }) {
  const navigate = createResetAfter({ setActorSelection, layers, playheadRef });
  return { enter: navigate(editor.enterSymbol), exit: navigate(editor.exitSymbol) };
}
