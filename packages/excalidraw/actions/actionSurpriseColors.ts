import { COLOR_PALETTE } from "@excalidraw/common";
import {
  CaptureUpdateAction,
  getNonDeletedElements,
  isTextElement,
  newElementWith,
} from "@excalidraw/element";

import { palette } from "../components/icons";
import { isSomeElementSelected } from "../scene";

import { register } from "./register";

const SURPRISE_HUES = [
  "red",
  "pink",
  "grape",
  "violet",
  "blue",
  "cyan",
  "teal",
  "green",
  "yellow",
  "orange",
] as const;

const randomHue = () =>
  SURPRISE_HUES[Math.floor(Math.random() * SURPRISE_HUES.length)];

/**
 * Repaints each selected element with a random hue, keeping stroke and
 * fill harmonious (dark shade for stroke, light shade for fill). Elements
 * with a transparent fill keep it transparent.
 */
export const actionSurpriseColors = register({
  name: "surpriseColors",
  label: "labels.surpriseColors",
  icon: palette,
  trackEvent: { category: "element" },
  predicate: (elements, appState) =>
    isSomeElementSelected(getNonDeletedElements(elements), appState),
  perform: (elements, appState) => {
    return {
      elements: elements.map((element) => {
        if (!appState.selectedElementIds[element.id]) {
          return element;
        }
        const shades = COLOR_PALETTE[randomHue()];
        return newElementWith(element, {
          strokeColor: shades[4],
          backgroundColor:
            isTextElement(element) ||
            element.backgroundColor === COLOR_PALETTE.transparent
              ? element.backgroundColor
              : shades[1],
        });
      }),
      appState,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});
