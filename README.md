<div align="center">
  <img src="pre%20design%20and%20conceptual%20architecture/LoneWolf%20logo.png" alt="LoneWolf logo" width="160" />

  # LoneWolf

  **A full-stack event-discovery platform — find local events, join them, and leave feedback.**

  [![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens)](https://jwt.io/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

  [API Docs](code/server/API_DOCS.md) · [Postman Collection](code/server/LoneWolf.postman_collection.json) · [Client Architecture](code/client/CLIENT_ARCHITECTURE.md)
</div>

---

## What it is

LoneWolf is a REST API + client for discovering, hosting, and attending local
events. A host publishes an event with a location and capacity; nearby users
can find it via geospatial search, join it, and leave a rating afterward.
Moderators can act on flagged content, and admins can audit every sensitive
action taken on the platform.

It's built as two independently runnable pieces:

| | |
|---|---|
| **`code/server/`** | Node.js / Express REST API, MongoDB (Mongoose), JWT auth |
| **`code/client/`** | Multi-page HTML / CSS / vanilla JS client — no framework, no build step |

## Engineering highlights

A few pieces worth a closer look if you're evaluating the code itself:

- **Atomic capacity control** — joining a full event is a race condition
  waiting to happen if you check-then-write in two steps. `joinEvent`
  (`code/server/controllers/eventController.js`) does the capacity and
  duplicate-join check *inside* a single `findOneAndUpdate` query
  (`$expr: { $lt: [{ $size: "$participants" }, "$capacity"] }`), so two
  simultaneous join requests can't both slip past a stale "still has room"
  check.
- **Geospatial search without a paid API** — `getNearbyEvents` implements
  the Haversine formula directly to compute distance between a user and
  every active event, rather than depending on Google's Distance Matrix API.
- **Layered, role-aware authorization** — every route composes small,
  single-purpose middleware (`protect` → verifies the JWT; `adminOnly` →
  checks the role) ahead of validation middleware ahead of the controller.
  Controllers add their own ownership checks on top (e.g. only an event's
  host, or an admin, can delete it).
- **Input validation at the boundary** — every mutating endpoint runs
  `express-validator` rule chains (date ordering, lat/lng ranges, ObjectId
  shape, password length) before touching the database, so malformed input
  fails with a clean `400` instead of a raw Mongoose `CastError`/`ValidationError`.
- **A real audit trail** — sensitive actions (event deletion, user
  suspension) write structured entries to an `AuditLog` collection, queryable
  by admins via `GET /api/admin/audit` — not just `console.log`.
- **API documentation that's actually usable** — every one of the 22
  endpoints has a Postman-collection entry with a description, a sample
  request, and saved example responses for both the success and the
  relevant error cases (see [`API_DOCS.md`](code/server/API_DOCS.md)).

## Tech stack

**Backend**
- Node.js, Express 5
- MongoDB + Mongoose (schema validation, indexes, population)
- JWT (`jsonwebtoken`) for stateless auth, `bcrypt` for password hashing
- `express-validator` for request validation
- `dotenv` for configuration, `cors` for cross-origin requests

**Frontend**
- Plain HTML5 / CSS3 / ES modules — deliberately framework-free, to
  demonstrate fluency with the DOM, `fetch`, and module-based JS
  organization without relying on a framework's abstractions
- `localStorage`-backed session handling

**API design & docs**
- RESTful resource modeling across 7 modules (Auth, Users, Events, Feedback,
  Reports, Notifications, Admin)
- Postman Collection v2.1 with full request/response documentation

## Architecture

```
client (HTML/CSS/JS)  --HTTP/JSON-->  server (Express)  -->  MongoDB
                                            |
                                  routes -> validators -> controllers -> models
```

The server follows a consistent layered pattern per module:

```
routes/*.js       — wires middleware (auth, validation) to controller functions
validators/*.js   — express-validator rule chains, fail fast with 400
controllers/*.js  — HTTP <-> business logic translation, never touches the DB directly
models/*.js       — Mongoose schemas + pure data-access functions
```

See [`code/server/func_implement.md`](code/server/func_implement.md) for the
full endpoint map, and [`code/client/CLIENT_ARCHITECTURE.md`](code/client/CLIENT_ARCHITECTURE.md)
for how the client is organized.

## API modules

| Module | Endpoints |
|---|---|
| **Auth** | Register, login (JWT issuance) |
| **Users / Admin** | Profile, list users, suspend a user |
| **Events** | CRUD, geospatial nearby search, join/leave, `.ics` calendar export |
| **Feedback** | Rate and comment on attended events |
| **Reports** | Flag events for moderation, admin review/resolution |
| **Notifications** | Per-user alerts, mark-as-read |
| **Admin** | Audit log of sensitive actions |

Full request/response contract: [`code/server/API_DOCS.md`](code/server/API_DOCS.md).

## Running it locally

**Server**
```bash
cd code/server
npm install
# create a .env with PORT, MONGO_URI, JWT_SECRET
npm start
```

**Client**
```bash
cd code/client
npm start   # serves the static site at http://localhost:3000
```

## Project docs

Pre-implementation design artifacts (SRS, SDD, wireframes) live in
[`pre design and conceptual architecture/`](pre%20design%20and%20conceptual%20architecture/).
