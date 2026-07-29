# Public anonymous fan messages

The website can display anonymous visitor messages without requiring visitor accounts. GitHub Pages hosts the frontend; a Cloudflare Worker and D1 database store the messages.

## 1. Create the Cloudflare resources

1. Install Node.js 20 or newer and sign in to Cloudflare:

   ```bash
   npx wrangler login
   ```

2. Create the D1 database:

   ```bash
   npx wrangler d1 create ctxczl-fan-messages
   ```

3. Copy the returned `database_id` into `workers/fan-messages/wrangler.toml`.


## 2. Create the database and deploy the Worker

From the project root:

```bash
npx wrangler d1 migrations apply ctxczl-fan-messages --remote --config workers/fan-messages/wrangler.toml
npx wrangler secret put RATE_LIMIT_SALT --config workers/fan-messages/wrangler.toml
npx wrangler deploy --config workers/fan-messages/wrangler.toml
```

For `RATE_LIMIT_SALT`, use a long random string. Never put this secret in the Git repository.

The deployment command prints a Worker URL such as:

```text
https://ctxczl-fan-messages.<your-subdomain>.workers.dev
```

Use the full endpoint below, including `/api/fan-messages`.

## 3. Configure GitHub Pages build variables

In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables**, then create these repository variables:

| Variable | Value |
| --- | --- |
| `VITE_FAN_MESSAGES_API_URL` | `https://ctxczl-fan-messages.<your-subdomain>.workers.dev/api/fan-messages` |

The GitHub Pages workflow reads this variable during its build. After saving it, rerun the Pages workflow or push a new commit.

## Local development

Create `.env.local` in the project root (it is ignored by Git):

```dotenv
VITE_FAN_MESSAGES_API_URL=https://ctxczl-fan-messages.<your-subdomain>.workers.dev/api/fan-messages
```

Without these variables, the local Vite message endpoint remains available for development only.

## Operational behavior

- `GET /api/fan-messages` returns the 200 newest messages.
- `POST /api/fan-messages` stores one anonymous message after input validation.
- Each visitor IP is rate-limited to one post every 30 seconds. The Worker stores only a salted SHA-256 hash for rate limiting.
- The client refreshes messages every 30 seconds.

To moderate or remove messages initially, use Cloudflare D1's SQL console. A protected administrator API can be added later if needed.
