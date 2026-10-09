# Jeezy Playground API

Generic CRUD API over Firebase Realtime Database, deployed as Vercel serverless functions.

## Setup

1. In the Vercel dashboard, open the project -> **Settings -> Environment Variables** and add:
   - `FIREBASE_SERVICE_ACCOUNT` — the full Firebase service-account JSON, pasted as a single line.
   - `FIREBASE_DATABASE_URL` — e.g. `https://your-project-default-rtdb.firebaseio.com`
   - `API_KEY` — a long random string you make up. Clients send it as the `x-api-key` header.
2. Push to `main` — Vercel auto-deploys.

> Note: GitHub Actions secrets are NOT visible to Vercel at runtime. The key must
> live in Vercel's environment variables (above). The Actions secret is only
> needed if a GitHub workflow itself touches Firebase.

## API

Base: `https://<your-vercel-app>.vercel.app/api/crud?path=/<node>`

All requests need the `x-api-key` header (unless `API_KEY` is unset).

| Method | Meaning | Example |
| --- | --- | --- |
| `GET` | Read the value at `path` | `GET /api/crud?path=/todos` |
| `POST` | Create: push a new child under `path`, returns its key | `POST /api/crud?path=/todos` + JSON body |
| `PUT` | Replace: overwrite everything at `path` | `PUT /api/crud?path=/todos/abc123` + JSON body |
| `PATCH` | Update: merge fields at `path` | `PATCH /api/crud?path=/todos/abc123` + `{"done":true}` |
| `DELETE` | Remove the node at `path` | `DELETE /api/crud?path=/todos/abc123` |

```bash
# read
curl -H "x-api-key: $API_KEY" "https://<app>.vercel.app/api/crud?path=/todos"

# create
curl -X POST -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"title":"buy milk","done":false}' \
  "https://<app>.vercel.app/api/crud?path=/todos"

# update
curl -X PATCH -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"done":true}' \
  "https://<app>.vercel.app/api/crud?path=/todos/<key>"

# delete
curl -X DELETE -H "x-api-key: $API_KEY" \
  "https://<app>.vercel.app/api/crud?path=/todos/<key>"
```
