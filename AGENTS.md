# Base44 Dev Environment

- **Run:** `docker compose -f docker-compose.base44.yml up -d` — starts the Vite dev server on port 3000 with live reload.
- **Stack:** node:24 base image, source bind-mounted, deps installed via `yarn --frozen-lockfile` on container start. `node_modules` lives in a named volume.
- **No external credentials needed** — Excalidraw is local-first. `.env.development` already contains public dev configs (Firebase, backend URLs). Collaboration/AI features point to external services but the whiteboard works without them.
- The repo's own `docker-compose.yml` builds a production nginx image (not suitable for dev editing) — don't use it for development.
- Vite config was modified: `server.open` set to `false` and `server.host` set to `true` for container compatibility.

# Guidelines

- For new DOM/browser API usage, use `app.ownerDocument` and `app.ownerWindow` instead of globals; without `app`, derive them from the mounted node's `ownerDocument` and its `defaultView`.
- When overriding properties of an existing type, prefer `Merge<Base, Overrides>` from `@excalidraw/common/utility-types` over `Omit<Base, keyof Overrides> & Overrides`.
