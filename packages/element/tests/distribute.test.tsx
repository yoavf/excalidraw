import {
  distributeHorizontally,
  distributeVertically,
  arrangeInCircle,
} from "@excalidraw/excalidraw/actions";
import { defaultLang, setLanguage } from "@excalidraw/excalidraw/i18n";
import { Excalidraw } from "@excalidraw/excalidraw";

import { API } from "@excalidraw/excalidraw/tests/helpers/api";
import { UI, Pointer, Keyboard } from "@excalidraw/excalidraw/tests/helpers/ui";
import {
  act,
  unmountComponent,
  render,
} from "@excalidraw/excalidraw/tests/test-utils";

const mouse = new Pointer("mouse");

// Scenario: three rectangles that will be distributed with gaps
const createAndSelectThreeRectanglesWithGap = () => {
  UI.clickTool("rectangle");
  mouse.down();
  mouse.up(100, 100);
  mouse.reset();

  UI.clickTool("rectangle");
  mouse.down(10, 10);
  mouse.up(100, 100);
  mouse.reset();

  UI.clickTool("rectangle");
  mouse.down(300, 300);
  mouse.up(100, 100);
  mouse.reset();

  // Last rectangle is selected by default
  Keyboard.withModifierKeys({ shift: true }, () => {
    mouse.click(0, 10);
    mouse.click(10, 0);
  });
};

// Scenario: three rectangles that will be distributed by their centers
const createAndSelectThreeRectanglesWithoutGap = () => {
  UI.clickTool("rectangle");
  mouse.down();
  mouse.up(100, 100);
  mouse.reset();

  UI.clickTool("rectangle");
  mouse.down(10, 10);
  mouse.up(200, 200);
  mouse.reset();

  UI.clickTool("rectangle");
  mouse.down(200, 200);
  mouse.up(100, 100);
  mouse.reset();

  // Last rectangle is selected by default
  Keyboard.withModifierKeys({ shift: true }, () => {
    mouse.click(0, 10);
    mouse.click(10, 0);
  });
};

describe("distributing", () => {
  beforeEach(async () => {
    unmountComponent();
    mouse.reset();

    await act(() => {
      return setLanguage(defaultLang);
    });
    await render(<Excalidraw handleKeyboardGlobally={true} />);
  });

  it("should distribute selected elements horizontally", async () => {
    createAndSelectThreeRectanglesWithGap();
    expect(API.getSelectedElements()[0].x).toEqual(0);
    expect(API.getSelectedElements()[1].x).toEqual(10);
    expect(API.getSelectedElements()[2].x).toEqual(300);

    API.executeAction(distributeHorizontally);

    expect(API.getSelectedElements()[0].x).toEqual(0);
    expect(API.getSelectedElements()[1].x).toEqual(150);
    expect(API.getSelectedElements()[2].x).toEqual(300);
  });

  it("should distribute selected elements vertically", async () => {
    createAndSelectThreeRectanglesWithGap();
    expect(API.getSelectedElements()[0].y).toEqual(0);
    expect(API.getSelectedElements()[1].y).toEqual(10);
    expect(API.getSelectedElements()[2].y).toEqual(300);

    API.executeAction(distributeVertically);

    expect(API.getSelectedElements()[0].y).toEqual(0);
    expect(API.getSelectedElements()[1].y).toEqual(150);
    expect(API.getSelectedElements()[2].y).toEqual(300);
  });

  it("should distribute selected elements horizontally based on their centers", async () => {
    createAndSelectThreeRectanglesWithoutGap();
    expect(API.getSelectedElements()[0].x).toEqual(0);
    expect(API.getSelectedElements()[1].x).toEqual(10);
    expect(API.getSelectedElements()[2].x).toEqual(200);

    API.executeAction(distributeHorizontally);

    expect(API.getSelectedElements()[0].x).toEqual(0);
    expect(API.getSelectedElements()[1].x).toEqual(50);
    expect(API.getSelectedElements()[2].x).toEqual(200);
  });

  it("should distribute selected elements vertically with based on their centers", async () => {
    createAndSelectThreeRectanglesWithoutGap();
    expect(API.getSelectedElements()[0].y).toEqual(0);
    expect(API.getSelectedElements()[1].y).toEqual(10);
    expect(API.getSelectedElements()[2].y).toEqual(200);

    API.executeAction(distributeVertically);

    expect(API.getSelectedElements()[0].y).toEqual(0);
    expect(API.getSelectedElements()[1].y).toEqual(50);
    expect(API.getSelectedElements()[2].y).toEqual(200);
  });

  it("should arrange selected elements evenly around a circle", async () => {
    createAndSelectThreeRectanglesWithGap();
    API.executeAction(arrangeInCircle);

    const centers = API.getSelectedElements().map((el) => [
      el.x + el.width / 2,
      el.y + el.height / 2,
    ]);
    const cx = centers.reduce((a, c) => a + c[0], 0) / 3;
    const cy = centers.reduce((a, c) => a + c[1], 0) / 3;
    const radii = centers.map(([x, y]) => Math.hypot(x - cx, y - cy));

    expect(radii[0]).toBeGreaterThan(0);
    expect(radii[1]).toBeCloseTo(radii[0]);
    expect(radii[2]).toBeCloseTo(radii[0]);
  });
});
