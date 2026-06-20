# Client ↔ Server Integration

How the plain HTML/CSS/JS multi-page client talks to the Express/MongoDB
server in `code/server/`.

## Serving the client

Because pages navigate via real `<a href="...">` links and fetch calls to
`http://localhost:5000`, the client should be served over `http://`, not
opened directly as a `file://` path — some browsers treat `file://` as a
`null` origin, which can behave inconsistently with CORS. Use any static
file server during development (e.g. the VS Code "Live Server" extension,
or `npx serve code/client`).

## Base URL

The server runs at `http://localhost:5000` (see `code/server/.env`'s
`PORT`). The client keeps this in one place: `js/api/config.js` exports
`API_BASE_URL`. Every `api/*.js` file builds its request URLs from that
constant — change the server's address in exactly one file if it ever moves.

## CORS

The server already has `app.use(cors())` in `code/server/server.js`, so it
accepts cross-origin requests from the client regardless of what port the
client is served on.

## Request flow

Every network call goes through `js/api/http.js`'s `request()` helper, which
every `api/*.js` module wraps:

```
page script (js/pages/*.js, loaded by its matching .html)
  -> api module (js/api/eventsApi.js, authApi.js, ...)
    -> request() (js/api/http.js)
      -> fetch(`${API_BASE_URL}${path}`, ...)
```

`request()` is responsible for:
- Setting `Content-Type: application/json` when a body is sent.
- Attaching `Authorization: Bearer <token>` automatically when the call is
  marked `auth: true`, reading the token via `js/utils/auth.js`.
- Parsing the response (JSON vs. text, for the one non-JSON endpoint:
  `GET /api/events/:id/calendar`, which returns an `.ics` file - that one is
  a direct link/download, not a `fetch()` call).
- Throwing a single `Error` with the server's `message` (or first validation
  error) on any non-2xx response, so every page can use one `try/catch`
  instead of re-checking `response.ok` everywhere.

## Auth/session handling across page loads

Since this is a real multi-page site (full navigation, not a SPA), session
state can't live in memory — it has to survive a page reload. That's why
`js/utils/auth.js` stores the token/user in `localStorage` rather than a
JS variable:

- `POST /api/auth/login` returns `{ token, user }`. `loginPage.js` calls
  `setSession(token, user)` on success, then navigates to e.g.
  `events.html`.
- Every page that needs to know "is someone logged in" (to show/hide the
  admin link, redirect away from `admin.html` if not an admin, etc.) calls
  `isLoggedIn()` / `isAdmin()` from `js/utils/auth.js` on page load — each
  page's script re-checks this itself, since there's no shared in-memory
  app state between page loads.
- Every protected API call passes `auth: true` to `request()`, which reads
  the stored token and sets the `Authorization` header.
- Logout clears the stored session (`clearSession()`) and navigates back to
  `index.html`.

## Page ↔ server route map

| Page (`.html`) | Page script | Server route(s) it calls |
|---|---|---|
| `login.html` | `loginPage.js` | `POST /api/auth/login` |
| `register.html` | `registerPage.js` | `POST /api/auth/register` |
| `profile.html` | `profilePage.js` | `GET /api/users/me` |
| `events.html` | `eventsPage.js` | `GET /api/events`, `GET /api/events/nearby` |
| `event-detail.html` | `eventDetailPage.js` | `GET /api/events/:id`, `POST/DELETE /api/events/:id/join`, `GET /api/events/:id/calendar`, `POST /api/events/:id/feedback`, `GET /api/events/:id/feedback`, `POST /api/events/:id/report` |
| `notifications.html` | `notificationsPage.js` | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| `admin.html` | `adminPage.js` | `GET /api/users`, `PATCH /api/users/:id/suspend`, `GET /api/reports`, `PATCH /api/reports/:id/resolve`, `GET /api/admin/audit` |

`event-detail.html` identifies which event to load via a query string, e.g.
`event-detail.html?id=665f2a2b3c4d5e6f7a8b9c0e` — `eventDetailPage.js` reads
it with `new URLSearchParams(window.location.search)`.

## Error handling on the client

Because `request()` always throws on a non-2xx response, every page script
follows the same pattern:

```js
try {
  const data = await someApi.someCall(...);
  // write data into existing containers in this page's HTML
} catch (err) {
  showToast(err.message, "error"); // js/components/toast.js - never alert()
}
```

This keeps server error messages (`{ message: "..." }` or
`{ errors: [...] }` from `express-validator`) surfacing directly to the user
through the toast/modal components, instead of generic "something went
wrong" text.

## Reference

For the full endpoint-by-endpoint contract (descriptions, example
requests/responses, error cases), see:
- `code/server/API_DOCS.md`
- `code/server/LoneWolf.postman_collection.json`
