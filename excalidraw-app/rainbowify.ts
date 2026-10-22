import { newElementWith } from "@excalidraw/element";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

/** Recolors selected elements (or all, if none selected) across a rainbow,
 * ordered left-to-right by position. */
export const rainbowify = (api: ExcalidrawImperativeAPI) => {
  const elements = api.getSceneElements();
  const { selectedElementIds } = api.getAppState();
  const hasSelection = elements.some((el) => selectedElementIds[el.id]);
  const targets = elements
    .filter((el) => !hasSelection || selectedElementIds[el.id])
    .sort((a, b) => a.x - b.x);

  if (!targets.length) {
    api.setToast({ message: "Draw something first 🌈" });
    return;
  }

  const colors = new Map(
    targets.map((el, i) => [
      el.id,
      `hsl(${Math.round((i / targets.length) * 360)}, 80%, 50%)`,
    ]),
  );

  api.updateScene({
    elements: elements.map((el) => {
      const color = colors.get(el.id);
      return color ? newElementWith(el, { strokeColor: color }) : el;
    }),
    captureUpdate: "IMMEDIATELY",
  });
  api.setToast({ message: "Rainbowified! 🌈", duration: 2000 });
};
