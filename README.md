# Access Guard

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nagorik11/accessguard-enterprise-concierge-access-system)

A production-ready full-stack application powered by Cloudflare Workers. Features a modern React frontend with shadcn/ui, Tailwind CSS, and a robust backend using Hono and Durable Objects for scalable, multi-tenant entity storage (Users, Chats, Messages). Includes real-time capabilities, pagination, CRUD operations, and automatic seeding.

## ✨ Key Features

- **Full-Stack TypeScript**: Shared types between frontend and backend for type safety.
- **Durable Objects Storage**: Efficient, indexed entity storage for Users, ChatBoards, and Messages with CAS concurrency control.
- **API-First Backend**: RESTful endpoints with CORS, logging, health checks, and error reporting.
- **Modern React UI**: Vite-powered, shadcn/ui components, TanStack Query, React Router, dark mode, sidebar layout.
- **Production Optimized**: Tailwind CSS with animations, theme support, responsive design, error boundaries.
- **Demo Data**: Pre-seeded users, chats, and messages for instant testing.
- **Cloudflare Native**: Workers for dynamic API, Pages for static assets, zero-cold-start Durable Objects.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Router, Lucide Icons, Sonner (toasts), Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects (GlobalDurableObject with indexes).
- **Data**: SQLite-backed Durable Objects for entities (no external DB needed).
- **Dev Tools**: Bun, ESLint, TypeScript 5, Cloudflare Vite Plugin.
- **Other**: Immer, Zod, UUID, CORS, Logging.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended package manager)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (`npm i -g wrangler`)

### Installation
```bash
bun install
```

### Generate Worker Types
```bash
bun run cf-typegen
```

### Development
```bash
bun dev
```
- Starts Vite dev server on `http://localhost:3000` (or `$PORT`).
- Edit `src/pages/HomePage.tsx` to build your UI.
- API routes available at `/api/*` (proxied in dev).

**Live Preview with Workers**:
```bash
bun run build
wrangler pages dev dist
```
- Serves static assets + dynamic Worker API.

### Testing APIs
Test endpoints directly (seed data auto-loads on first request):

```bash
# List users (seeded)
curl "http://localhost:3000/api/users"

# Create chat
curl -X POST "http://localhost:3000/api/chats" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Chat"}'

# List messages in chat
curl "http://localhost:3000/api/chats/c1/messages"

# Send message
curl -X POST "http://localhost:3000/api/chats/c1/messages" \
  -H "Content-Type: application/json" \
  -d '{"userId": "u1", "text": "Hello!"}'
```

Available endpoints: `/api/users`, `/api/chats`, `/api/chats/:id/messages`, DELETE ops.

## 🧑‍💻 Development Workflow

1. **Frontend**: Edit files in `src/`. Use shadcn components (`@components/ui/*`), hooks (`@hooks/*`), replace `HomePage.tsx`.
2. **Backend**: Add routes in `worker/user-routes.ts`. Extend entities in `worker/entities.ts` (uses `IndexedEntity` base).
3. **Shared Types**: Edit `shared/types.ts`, `shared/mock-data.ts` for seed data.
4. **Custom Entities**:
   ```ts
   // worker/entities.ts
   export class MyEntity extends IndexedEntity<MyType> {
     static readonly entityName = "myentity";
     static readonly indexName = "myentities";
     static readonly initialState: MyType = { id: "", ... };
     static seedData = [...];
   }
   ```
   Add routes in `user-routes.ts`.
5. **Lint & Type Check**:
   ```bash
   bun lint
   ```
6. **Build**:
   ```bash
   bun build
   ```

**Pro Tip**: Restart dev server after `cf-typegen` for Worker type updates.

## ☁️ Deployment

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   wrangler whoami
   ```

2. **Deploy**:
   ```bash
   bun run deploy
   ```
   - Builds frontend assets.
   - Deploys Worker + Pages site.
   - Your app is live at `https://<subdomain>.pages.dev` or custom domain.

3. **One-Click Deploy**:
   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nagorik11/accessguard-enterprise-concierge-access-system)

4. **Configure**:
   - Update `wrangler.jsonc` for bindings/migrations.
   - Set up custom domain: `wrangler pages deploy dist --project-name <name>`.
   - View logs: `wrangler tail`.

## 📚 Customization Guide

- **Remove Sidebar**: Delete `AppLayout` usage, edit `src/components/app-sidebar.tsx`.
- **Theme**: Toggle with `ThemeToggle`, customize `tailwind.config.js` / `src/index.css`.
- **API Client**: Use `api()` from `@/lib/api-client.ts` with TanStack Query.
- **Error Reporting**: Auto-reports to `/api/client-errors`.
- **Queries**: Wrap in `QueryClientProvider` (in `main.tsx`).

## 🤝 Contributing

1. Fork & clone.
2. `bun install`.
3. Make changes, `bun lint`.
4. Test locally, submit PR.

## ⚠️ Important Notes

- **Do not modify**: `worker/core-utils.ts`, `worker/index.ts` (core infra).
- **Single Durable Object**: Scales to millions of entities via prefixed storage.
- **Migrations**: Auto-handled for new DO classes.
- **Observability**: Enabled via `wrangler.jsonc`.

## 📄 License

MIT. Built with [Cloudflare Workers Templates](https://developers.cloudflare.com/workers/).