# LoneWolf Client — Directory Structure & Architecture

Plain HTML / CSS / JavaScript client (no framework, no build step). A real
**multi-page site**: one `.html` file per page, with its own static markup.
JavaScript only adds *behavior* (fetch calls, event listeners, populating
dynamic content into containers that already exist in the HTML) — it never
builds a page's structural markup from template strings. No inline
`style=""` attributes, no `alert`/`confirm`/`prompt` (a custom modal/toast is
used instead), no unjustified `!important`.

## Directory tree

```
client/
├── index.html                  # Home page
├── login.html
├── register.html
├── events.html                  # Browse / search events
├── event-detail.html            # Single event (?id=<eventId>)
├── profile.html                 # My profile
├── notifications.html
├── admin.html                   # Users, reports, audit log
│
├── js/
│   ├── api/                    # one file per server module - all server communication lives here
│   │   ├── config.js            # API_BASE_URL constant
│   │   ├── http.js              # shared fetch wrapper (auth header, error handling)
│   │   ├── authApi.js           # register, login
│   │   ├── usersApi.js          # profile, list users, suspend
│   │   ├── eventsApi.js         # CRUD, nearby, join/leave, calendar export
│   │   ├── feedbackApi.js       # submit feedback, get event feedback
│   │   ├── reportsApi.js        # create report, list/resolve reports
│   │   ├── notificationsApi.js  # list notifications, mark as read
│   │   └── adminApi.js          # audit logs
│   │
│   ├── pages/                  # one file per .html page, same name pattern
│   │   ├── homePage.js          # <- index.html
│   │   ├── loginPage.js         # <- login.html
│   │   ├── registerPage.js      # <- register.html
│   │   ├── eventsPage.js        # <- events.html
│   │   ├── eventDetailPage.js   # <- event-detail.html
│   │   ├── profilePage.js       # <- profile.html
│   │   ├── notificationsPage.js # <- notifications.html
│   │   └── adminPage.js         # <- admin.html
│   │
│   ├── components/             # reusable behavior attached to existing markup
│   │   ├── navbar.js              # active-link highlight, logout, admin-link visibility
│   │   ├── modal.js               # replaces confirm()/prompt()
│   │   ├── toast.js                # replaces alert()
│   │   ├── eventCard.js            # builds one card's DOM for a list container
│   │   └── notificationBell.js
│   │
│   └── utils/                  # cross-cutting helpers, no UI of their own
│       ├── auth.js               # token/user storage (localStorage wrapper)
│       ├── dom.js                  # small DOM creation/query helpers
│       └── validators.js           # client-side form validation
│
├── style/                      # one stylesheet per component/page group
│   ├── reset.css
│   ├── main.css                  # layout, typography, color variables
│   ├── navbar.css
│   ├── modal.css
│   ├── toast.css
│   ├── event-card.css
│   └── pages.css
│
└── images/                     # static image assets
```

## Layering rules

- **`*.html`** — owns all structural markup for its page: layout, forms,
  buttons, containers that JS will populate (e.g.
  `<div id="events-list"></div>` in `events.html`). The `<header id="navbar">`
  and `<div id="modal-root">` shell is repeated identically at the top of
  every page (no native HTML includes exist in a build-step-free static
  site, so this small duplication is intentional and consistent).
- **`js/api/`** — the only layer allowed to call `fetch`. Nothing else in the
  app talks to the network directly.
- **`js/pages/`** — one file per `.html` page. Selects existing elements
  from that page's DOM (by id/class), wires up event listeners, calls
  `api/` functions, and writes results into containers that already exist
  in the HTML. Does not construct whole-page layout in JS.
- **`js/components/`** — reusable behavior/small repeated-data rendering
  (e.g. `eventCard.js` builds one card's markup to insert into a list that
  already exists in the page — this is "repeated dynamic data," not
  page structure, so it's fine to build in JS).
- **`js/utils/`** — pure helpers with no DOM rendering responsibility besides
  `dom.js`'s low-level element helpers.
- **`style/`** — every visual rule. One file per component/page group so a
  page's styles don't bleed into another's. Classes only, no `style=""`
  attributes in HTML, no `!important` unless there's a documented reason
  (e.g. overriding a third-party widget's inline styles).

## Navigation

Plain `<a href="events.html">`-style links between pages — a real browser
navigation, full page load each time. No client-side router. Session state
(`localStorage`, via `js/utils/auth.js`) persists across page loads, so
login state survives navigating between pages.

## No `alert` / `confirm` / `prompt`

Per the project rules, none of these may be used to surface messages to the
user. Two reusable components replace them, attached into each page's
`#modal-root`:
- **`components/toast.js`** — transient success/error messages (replaces `alert`).
- **`components/modal.js`** — confirmation dialogs and forms-in-a-popup (replaces `confirm`/`prompt`).
