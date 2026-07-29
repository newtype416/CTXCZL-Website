# Cloudflare Pages deployment

The website is deployed on Cloudflare Pages (`ctxczl0730.pages.dev`). The anonymous message endpoint is implemented as a Pages Function at `/api/fan-messages`, avoiding any cross-origin call to `workers.dev`.

## Required Pages bindings

In **Workers & Pages → ctxczl0730 → Settings → Bindings**, add a **D1 database binding**:

| Variable name | Database |
| --- | --- |
| `DB` | `ctxczl-fan-messages` |

## Required Pages variables and secrets

In **Workers & Pages → ctxczl0730 → Settings → Variables and Secrets**, set these for the Production environment:

| Name | Type | Value |
| --- | --- | --- |
| `VITE_FAN_MESSAGES_API_URL` | Text | `/api/fan-messages` |
| `VITE_TURNSTILE_SITE_KEY` | Text | Your Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Secret | Your Turnstile secret key |
| `RATE_LIMIT_SALT` | Secret | A long random string |

Redeploy the Pages project after saving the D1 binding and variables. The frontend and API will then share `https://ctxczl0730.pages.dev`, so no Worker CORS configuration is required.
