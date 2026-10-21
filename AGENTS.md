# Guidelines

- For new DOM/browser API usage, use `app.ownerDocument` and `app.ownerWindow` instead of globals; without `app`, derive them from the mounted node's `ownerDocument` and its `defaultView`.
- When overriding properties of an existing type, prefer `Merge<Base, Overrides>` from `@excalidraw/common/utility-types` over `Omit<Base, keyof Overrides> & Overrides`.

## Base44 sandbox

- Run with `docker compose -f docker-compose.base44.yml up -d` (Vite dev server on port 3000; first boot runs `yarn install`, which takes a few minutes).
- Type-check: `docker compose -f docker-compose.base44.yml exec -T web yarn -s tsc -p tsconfig.json --noEmit`.
