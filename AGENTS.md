# Guidelines

- For new DOM/browser API usage, use `app.ownerDocument` and `app.ownerWindow` instead of globals; without `app`, derive them from the mounted node's `ownerDocument` and its `defaultView`.
- When overriding properties of an existing type, prefer `Merge<Base, Overrides>` from `@excalidraw/common/utility-types` over `Omit<Base, keyof Overrides> & Overrides`.

## Base44 sandbox

- Dev env: `docker compose -f docker-compose.base44.yml up -d` (Vite on 3001 inside the container, mapped to 3000). The first boot runs `yarn install` and takes a few minutes.
- Run tools inside the container, e.g. `docker compose -f docker-compose.base44.yml exec -T web yarn vitest run <file>` or `yarn tsc --noEmit -p tsconfig.json`.
