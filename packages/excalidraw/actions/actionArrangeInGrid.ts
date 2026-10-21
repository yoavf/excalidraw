import {
  CaptureUpdateAction,
  getCommonBoundingBox,
  getNonDeletedElements,
  getSelectedElementsByGroup,
  isFrameLikeElement,
  updateBoundElements,
  updateFrameMembershipOfSelectedElements,
} from "@excalidraw/element";
import { arrayToMap } from "@excalidraw/common";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { register } from "./register";

import type { AppClassProperties, AppState } from "../types";

const GRID_GAP = 20;

/**
 * Arranges selected elements (groups move as a unit) into a roughly square
 * grid, ordered by reading order (top-to-bottom, left-to-right), anchored at
 * the selection's top-left corner.
 */
const arrangeSelectedInGrid = (
  elements: readonly ExcalidrawElement[],
  appState: Readonly<AppState>,
  app: AppClassProperties,
) => {
  const selectedElements = app.scene.getSelectedElements(appState);
  const bounds = getCommonBoundingBox(selectedElements);

  const groups = getSelectedElementsByGroup(
    selectedElements,
    app.scene.getNonDeletedElementsMap(),
    appState,
  )
    .map(getNonDeletedElements)
    .filter((group) => group.length > 0)
    .map((group) => [group, getCommonBoundingBox(group)] as const)
    .sort((a, b) => a[1].minY - b[1].minY || a[1].minX - b[1].minX);

  const columns = Math.ceil(Math.sqrt(groups.length));
  const cellWidth = Math.max(...groups.map(([, box]) => box.width));
  const cellHeight = Math.max(...groups.map(([, box]) => box.height));

  const updated = groups.flatMap(([group, box], index) => {
    const dx =
      bounds.minX + (index % columns) * (cellWidth + GRID_GAP) - box.minX;
    const dy =
      bounds.minY +
      Math.floor(index / columns) * (cellHeight + GRID_GAP) -
      box.minY;

    return group.map((element) => {
      const next = app.scene.mutateElement(element, {
        x: element.x + dx,
        y: element.y + dy,
      });
      updateBoundElements(element, app.scene, {
        simultaneouslyUpdated: group,
      });
      return next;
    });
  });

  const updatedMap = arrayToMap(updated);
  return updateFrameMembershipOfSelectedElements(
    elements.map((element) => updatedMap.get(element.id) || element),
    appState,
    app,
  );
};

export const actionArrangeInGrid = register({
  name: "arrangeInGrid",
  label: "labels.arrangeInGrid",
  trackEvent: { category: "element" },
  predicate: (elements, appState, _, app) => {
    const selected = app.scene.getSelectedElements(appState);
    return (
      !selected.some(isFrameLikeElement) &&
      getSelectedElementsByGroup(
        selected,
        app.scene.getNonDeletedElementsMap(),
        appState,
      ).length > 1
    );
  },
  perform: (elements, appState, _, app) => ({
    appState,
    elements: arrangeSelectedInGrid(elements, appState, app),
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  }),
});
