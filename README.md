# HaShopee

A responsive React + TypeScript fashion and essentials store, ready for independent Cloudflare deployment after configuring its database, image bucket, and Google OAuth credentials.

## Included

- Light glass navigation, editorial imagery, responsive storefront and management screens.
- Categories and product options editable through Store Studio: clothing sizes, shoe sizes, or One size.
- Search, price sorting, product galleries, wishlist, cart, customer profiles, and order history.
- Google sign-in through the OAuth authorization-code flow with PKCE, state, nonce, issuer/audience checks, and token-signature validation using oauth4webapi.
- Opaque HttpOnly/Secure/SameSite cookies and hashed server-side sessions in D1. Google account subjects identify users; contact email edits cannot grant admin permissions.
- Server-authorized product editing, image upload, publishing, stock, and order management.
- Persistent order previews with server-calculated prices and immutable product snapshots. No real payments, shipments, or stock reservations yet.

## Deployment prerequisites

1. Create a D1 database named `hashopee-store`. Replace the placeholder `database_id` in `wrangler.jsonc` with the actual database UUID.
2. Create an R2 bucket named `hashopee-products`. R2 account activation is managed in Cloudflare; review its subscription/billing requirements before enabling it.
3. Connect this GitHub branch in Cloudflare Workers Builds. Use Worker name `hashopee-website`, build command `npm run build`, and deploy command `npm run deploy`. Use Node.js 24 or later for tests (Node.js 22.13+ for the runtime toolchain).
4. The deploy command applies pending schema migrations before uploading the Worker. Its deployment credential must have D1 edit permission in addition to Worker deployment permission. A fresh database uses both migrations in `drizzle/`.
5. Set the runtime variables and secrets listed below, then redeploy. Google login remains unavailable until these are configured.
6. Sign in as the authorized owner, open `/admin`, and select **Import existing collection** to add the original eight products. This inserts missing products without overwriting edits.

The current ChatGPT preview and this independent deployment use separate databases. Uploads, profiles, wishlists, and orders do not automatically transfer between them. This branch does not trust ChatGPT identity headers and does not require a ChatGPT account.

## Runtime configuration

Set values in Cloudflare **Worker → Settings → Variables and Secrets**:

| Name | Type | Value |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Variable or secret | OAuth Web application client ID |
| `GOOGLE_CLIENT_SECRET` | Secret | Google OAuth client secret |
| `AUTH_ORIGIN` | Variable | Exact HTTPS origin of the deployed store, without a trailing slash |
| `ADMIN_EMAILS` | Secret | Exact verified Google email address(es) authorized to manage products, comma-separated |

Keep actual secrets out of GitHub, screenshots, and chat messages. `DB` and `BUCKET` are resource bindings declared in `wrangler.jsonc`, not secret keys.

## Google login setup

1. Create/select a project in Google Cloud Console.
2. Configure Google Auth Platform branding, audience, and contact information. Request only basic `openid`, `email`, and `profile` identity scopes.
3. Create an OAuth client of type **Web application**.
4. Register `<AUTH_ORIGIN>/auth/callback` as an **Authorized redirect URI**, replacing `<AUTH_ORIGIN>` with the actual store origin. Example shape only: `https://your-store.workers.dev/auth/callback`.
5. Configure the resulting client ID and client secret in the Worker runtime.
6. If Google's app audience remains in Testing, add the owner and other testers as test users. Follow Google's publishing requirements before opening login to the public.
7. Check sign-in, profile saving, admin authorization, and sign-out. Sign-out revokes the store session; it does not sign out of Google itself. The next sign-in asks you to select a Google account.

## Local development

```bash
npm ci
npm run db:generate
npx wrangler d1 migrations apply DB --local --config wrangler.jsonc
npm run dev
```

Copy `.dev.vars.example` to `.dev.vars` for local runtime values. Authentication requires an HTTPS origin because its cookies use the secure `__Host-` prefix; use an HTTPS development origin registered with Google to exercise real login. Automated API tests use isolated SQLite and synthetic session fixtures.

```bash
npm test
npm run typecheck
npm run build
```

`npm run deploy:check` intentionally fails while the D1 placeholder is present. The application can build before provisioning, but it should not be deployed until its real database and image bucket are available.

## Project structure

- `components/`: storefront, account, admin, and responsive workspace navigation.
- `lib/store/`: validation, catalog handling, server pricing, database mapping, API client.
- `lib/auth/`: Google metadata, session lookup, cookie and redirect safeguards.
- `app/api/[...path]/route.ts`: catalog, customer, and administrator APIs.
- `app/auth/`: Google sign-in/callback, sign-out confirmation, and error handling.
- `db/schema.ts`, `drizzle/`: schema declarations and immutable migrations.
- `worker/index.ts`, `vite.config.ts`, `wrangler.jsonc`: standalone Cloudflare runtime and build configuration.
- `public/image/`: original product assets and optimized generated editorial hero.
- `legacy/`: archived original implementation, retained for reference.

Product images retained from the original repository need ownership and accuracy checks before commercial use. The generated campaign photo is editorial imagery, not a photograph of a specific catalog SKU. Its brief was a minimal menswear editorial in ivory and sand tones, warm limestone architecture, natural sunlight, no text or logos.

## Commercial launch

Add live provider checkout, signed/idempotent webhooks, stock reservation and per-variant quantities, fulfilment, shipping/tax rules, refunds, customer emails, policies, backups, monitoring, and production acceptance testing before taking money. Set a custom domain when ready and register its OAuth callback URL too.
