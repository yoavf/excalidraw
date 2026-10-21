# Guidelines

- For new DOM/browser API usage, use `app.ownerDocument` and `app.ownerWindow` instead of globals; without `app`, derive them from the mounted node's `ownerDocument` and its `defaultView`.
- When overriding properties of an existing type, prefer `Merge<Base, Overrides>` from `@excalidraw/common/utility-types` over `Omit<Base, keyof Overrides> & Overrides`.

## Base44 sandbox

- `docker-compose.base44.yml` runs the Vite dev server for `excalidraw-app` on port 3000; the first `yarn install` takes ~5+ min.
- `BROWSER=none` is required: `vite.config.mts` sets `open: true`, which crashes in a container without `xdg-open`.
- The Vite checker plugin doesn't surface all TS errors in logs; run `npx tsc -p tsconfig.json --noEmit` inside the `web` container.
