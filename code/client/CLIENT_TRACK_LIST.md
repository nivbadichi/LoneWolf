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
| `events.html` | ✅ (Pass 2: Google Maps view added as default, toggle vs. list) |
| `event-detail.html` | ✅ |
| `profile.html` | ✅ |
| `notifications.html` | ✅ |
| `admin.html` | ✅ |

## `js/api/` — server communication layer
| File | Status |
| :--- | :--- |
| `config.js` | ✅ |
| `http.js` | ✅ |
| `authApi.js` | ✅ |
| `usersApi.js` | ✅ (getMyProfile, updateMyProfile, getAllUsers, suspendUser) |
| `eventsApi.js` | ✅ (getAllEvents, getEventById, joinEvent, leaveEvent, deleteEvent, getCalendarUrl) |
| `feedbackApi.js` | ✅ |
| `reportsApi.js` | ✅ |
| `notificationsApi.js` | ✅ |
| `adminApi.js` | ✅ |

## `js/pages/` — one script per page
| File | Status |
| :--- | :--- |
| `homePage.js` | Removed — unused; index.html has no page-specific behavior beyond what navbar.js already provides |
| `loginPage.js` | ✅ |
| `registerPage.js` | ✅ |
| `eventsPage.js` | ✅ (Pass 2: map/list toggle wiring) |
| `eventDetailPage.js` | ✅ |
| `profilePage.js` | ✅ |
| `notificationsPage.js` | ✅ |
| `adminPage.js` | ✅ |

## `js/components/`
| File | Status |
| :--- | :--- |
| `toast.js` | ✅ |
| `modal.js` | ✅ |
| `navbar.js` | ✅ |
| `eventCard.js` | ✅ |
| `eventsMap.js` | ✅ [NEW — not in original architecture doc] Google Maps integration: dynamic script loading, geolocation, bounds-fitting, markers + InfoWindow popups |
| `notificationBell.js` | ✅ (repurposed as a single-notification-row renderer, same role as eventCard.js, rather than a navbar bell widget) |

## `js/utils/`
| File | Status |
| :--- | :--- |
| `auth.js` | ✅ |
| `dom.js` | ✅ |
| `validators.js` | ✅ |

## `style/`
| File | Status |
| :--- | :--- |
| `reset.css` | ✅ |
| `main.css` | ✅ |
| `pages.css` | ✅ |
| `navbar.css` | ✅ |
| `modal.css` | ✅ |
| `toast.css` | ✅ |
| `event-card.css` | ✅ |
