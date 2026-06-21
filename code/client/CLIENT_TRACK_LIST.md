# Client Build Tracker

Tracks implementation status of every file in `code/client/`, same purpose
and legend as `code/server/complete_folder_and_file_map.md`.

**Status legend:** ✅ Done & tested in a browser &nbsp;|&nbsp; 🚧 Written, not yet verified in a browser &nbsp;|&nbsp; ⬜ Not started

## Pages (`.html`)
| File | Status |
| :--- | :--- |
| `index.html` | ✅ (Bootstrap-based landing page, scoped to this page only) |
| `login.html` | ✅ |
| `register.html` | ✅ |
| `events.html` | ✅ (Pass 1: list view only — filters/nearby/map are Pass 2) |
| `event-detail.html` | ⬜ |
| `profile.html` | ✅ |
| `notifications.html` | ⬜ |
| `admin.html` | ⬜ |

## `js/api/` — server communication layer
| File | Status |
| :--- | :--- |
| `config.js` | ✅ |
| `http.js` | ✅ |
| `authApi.js` | ✅ |
| `usersApi.js` | ✅ (getMyProfile only — list/suspend pending, those are admin.html's job) |
| `eventsApi.js` | ✅ (getAllEvents only so far — nearby/join/leave/calendar pending) |
| `feedbackApi.js` | ⬜ |
| `reportsApi.js` | ⬜ |
| `notificationsApi.js` | ⬜ |
| `adminApi.js` | ⬜ |

## `js/pages/` — one script per page
| File | Status |
| :--- | :--- |
| `homePage.js` | N/A — not needed yet; navbar.js already handles this page's auth-visibility toggling (no other page-specific behavior exists yet) |
| `loginPage.js` | ✅ |
| `registerPage.js` | ✅ |
| `eventsPage.js` | ✅ (Pass 1: list view only) |
| `eventDetailPage.js` | ⬜ |
| `profilePage.js` | ✅ |
| `notificationsPage.js` | ⬜ |
| `adminPage.js` | ⬜ |

## `js/components/`
| File | Status |
| :--- | :--- |
| `toast.js` | ✅ |
| `modal.js` | ⬜ |
| `navbar.js` | ✅ |
| `eventCard.js` | ✅ |
| `notificationBell.js` | ⬜ |

## `js/utils/`
| File | Status |
| :--- | :--- |
| `auth.js` | ✅ |
| `dom.js` | ✅ |
| `validators.js` | ⬜ |

## `style/`
| File | Status |
| :--- | :--- |
| `reset.css` | ✅ |
| `main.css` | ✅ |
| `pages.css` | ✅ |
| `navbar.css` | ✅ |
| `modal.css` | ⬜ |
| `toast.css` | ⬜ |
| `event-card.css` | ✅ |
