import type { AppState } from "@excalidraw/excalidraw/types";

import { updateBoundElements } from "./binding";
import { getCommonBoundingBox } from "./bounds";

import { getSelectedElementsByGroup } from "./groups";

import { getNonDeletedElements } from ".";

import type { Scene } from "./Scene";

import type { ElementsMap, NonDeletedExcalidrawElement } from "./types";

export interface Distribution {
  space: "between";
  axis: "x" | "y";
}

export const distributeElements = (
  selectedElements: NonDeletedExcalidrawElement[],
  elementsMap: ElementsMap,
  distribution: Distribution,
  appState: Readonly<AppState>,
  scene: Scene,
): NonDeletedExcalidrawElement[] => {
  const [start, mid, end, extent] =
    distribution.axis === "x"
      ? (["minX", "midX", "maxX", "width"] as const)
      : (["minY", "midY", "maxY", "height"] as const);

  const bounds = getCommonBoundingBox(selectedElements);
  const groups = getSelectedElementsByGroup(
    selectedElements,
    elementsMap,
    appState,
  )
    .map(getNonDeletedElements) // Nothing to distribute on deleted elements
    .map((group) => [group, getCommonBoundingBox(group)] as const)
    .sort((a, b) => a[1][mid] - b[1][mid]);

  let span = 0;
  for (const group of groups) {
    span += group[1][extent];
  }

  const step = (bounds[extent] - span) / (groups.length - 1);

  if (step < 0) {
    // If we have a negative step, we'll need to distribute from centers
    // rather than from gaps. Buckle up, this is a weird one.

    // Get indices of boxes that define start and end of our bounding box
    const index0 = groups.findIndex((g) => g[1][start] === bounds[start]);
    const index1 = groups.findIndex((g) => g[1][end] === bounds[end]);

    // Get our step, based on the distance between the center points of our
    // start and end boxes
    const step =
      (groups[index1][1][mid] - groups[index0][1][mid]) / (groups.length - 1);

    let pos = groups[index0][1][mid];

    return groups.flatMap(([group, box], index) => {
      const translation = {
        x: 0,
        y: 0,
      };

      // Don't move our start and end boxes
      if (index !== index0 && index !== index1) {
        pos += step;
        translation[distribution.axis] = pos - box[mid];
      }

      return group.map((element) => {
        const updatedElement = scene.mutateElement(element, {
          x: element.x + translation.x,
          y: element.y + translation.y,
        });
        updateBoundElements(element, scene, {
          simultaneouslyUpdated: group,
        });
        return updatedElement;
      });
    });
  }

  // Distribute from gaps

  let pos = bounds[start];

  return groups.flatMap(([group, box]) => {
    const translation = {
      x: 0,
      y: 0,
    };

    translation[distribution.axis] = pos - box[start];

    pos += step;
    pos += box[extent];

    return group.map((element) => {
      const updatedElement = scene.mutateElement(element, {
        x: element.x + translation.x,
        y: element.y + translation.y,
      });
      updateBoundElements(element, scene, {
        simultaneouslyUpdated: group,
      });
      return updatedElement;
    });
  });
};

/**
 * Arranges selected elements (respecting groups) evenly around a circle
 * centered on their common bounding box, preserving their angular order.
 */
export const arrangeElementsInCircle = (
  selectedElements: NonDeletedExcalidrawElement[],
  elementsMap: ElementsMap,
  appState: Readonly<AppState>,
  scene: Scene,
): NonDeletedExcalidrawElement[] => {
  const bounds = getCommonBoundingBox(selectedElements);
  const cx = bounds.midX;
  const cy = bounds.midY;

  const groups = getSelectedElementsByGroup(
    selectedElements,
    elementsMap,
    appState,
  )
    .map(getNonDeletedElements)
    .map((group) => [group, getCommonBoundingBox(group)] as const)
    .sort(
      (a, b) =>
        Math.atan2(a[1].midY - cy, a[1].midX - cx) -
        Math.atan2(b[1].midY - cy, b[1].midX - cx),
    );

  // big enough so neighbours don't overlap, but at least the current size
  const circumference = groups.reduce(
    (acc, [, box]) => acc + Math.hypot(box.width, box.height),
    0,
  );
  const radius = Math.max(
    Math.min(bounds.width, bounds.height) / 2,
    circumference / (2 * Math.PI),
  );

  const startAngle = Math.atan2(groups[0][1].midY - cy, groups[0][1].midX - cx);

  return groups.flatMap(([group, box], index) => {
    const angle = startAngle + (index * 2 * Math.PI) / groups.length;
    const dx = cx + radius * Math.cos(angle) - box.midX;
    const dy = cy + radius * Math.sin(angle) - box.midY;

    return group.map((element) => {
      const updatedElement = scene.mutateElement(element, {
        x: element.x + dx,
        y: element.y + dy,
      });
      updateBoundElements(element, scene, { simultaneouslyUpdated: group });
      return updatedElement;
    });
  });
};
