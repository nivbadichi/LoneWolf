## API Endpoints & Controller Implementation Map

**Status legend:** ✅ Done & tested &nbsp;|&nbsp; 🚧 In progress &nbsp;|&nbsp; ⬜ Not started

### 1. Authentication Module

**Router:** `routes/authRoutes.js` | **Controller:** `controllers/authController.js`

| Status | Endpoint                  | Function       | Description                                                                                 |
| :----- | :------------------------ | :------------- | :------------------------------------------------------------------------------------------ |
| ✅     | `POST /api/auth/register` | `registerUser` | Validates Guest input, hashes the password using bcrypt, and creates a new Registered User. |
| ✅     | `POST /api/auth/login`    | `loginUser`    | Authenticates credentials and returns a JWT (JSON Web Token) for protected routes.          |

### 2. User & Admin Management Module

**Router:** `routes/userRoutes.js` | **Controller:** `controllers/userController.js`

| Status | Endpoint                       | Function         | Description                                                                                           |
| :----- | :----------------------------- | :--------------- | :---------------------------------------------------------------------------------------------------- |
| ✅     | `GET /api/users/me`            | `getUserProfile` | Retrieves the profile of the authenticated user, including their participation records. _(Protected)_ |
| ✅     | `GET /api/users`               | `getAllUsers`    | Retrieves a list of all registered users. _(Protected: Admin only)_                                   |
| ✅     | `PATCH /api/users/:id/suspend` | `suspendUser`    | Allows an Admin to suspend or ban a user account for violating rules. _(Protected: Admin only)_       |

### 3. Events Module

**Router:** `routes/eventRoutes.js` | **Controller:** `controllers/eventController.js`

| Status | Endpoint                       | Function           | Description                                                                                         |
| :----- | :----------------------------- | :----------------- | :-------------------------------------------------------------------------------------------------- |
| 🚧     | `GET /api/events`              | `getAllEvents`     | Retrieves events. Implements multi-filter logic (by category, start/end time) via query parameters. |
| 🚧     | `GET /api/events/nearby`       | `getNearbyEvents`  | Discovers nearby events using a Haversine/geo-spatial proximity search (`lat`, `lng`, `radius`).    |
| 🚧     | `GET /api/events/:id`          | `getEventById`     | Fetches the full details of a single event.                                                         |
| 🚧     | `POST /api/events`             | `createEvent`      | Allows a User to publish a new event, becoming its host. _(Protected)_                              |
| 🚧     | `PATCH /api/events/:id`        | `updateEvent`      | Allows the event's host to modify its details. _(Protected: host of this event only)_               |
| 🚧     | `DELETE /api/events/:id`       | `deleteEvent`      | Allows the event's host to cancel it, or an Admin to remove it. _(Protected)_                       |
| 🚧     | `GET /api/events/:id/calendar` | `exportToCalendar` | Generates an `.ics` event schedule entry to integrate with external Calendar Services.              |

### 4. Event Attendance

**Router:** `routes/eventRoutes.js` | **Controller:** `controllers/eventController.js`

| Status | Endpoint                      | Function     | Description                                                                                       |
| :----- | :---------------------------- | :----------- | :------------------------------------------------------------------------------------------------ |
| ⬜     | `POST /api/events/:id/join`   | `joinEvent`  | Reserves a place in an event. Uses atomic transaction to check available capacity. _(Protected)_  |
| ⬜     | `DELETE /api/events/:id/join` | `leaveEvent` | Aborts attendance, removes the user from the list, and releases the reserved place. _(Protected)_ |

### 5. Feedback Module

**Router:** `routes/feedbackRoutes.js` | **Controller:** `controllers/feedbackController.js`

| Status | Endpoint                        | Function           | Description                                                                                  |
| :----- | :------------------------------ | :----------------- | :------------------------------------------------------------------------------------------- |
| 🚧     | `POST /api/events/:id/feedback` | `submitFeedback`   | Allows a Registered User to submit a rating/review for an event they attended. _(Protected)_ |
| 🚧     | `GET /api/events/:id/feedback`  | `getEventFeedback` | Retrieves all feedback and ratings associated with a specific event.                         |

### 6. Notifications Module

**Router:** `routes/notificationRoutes.js` | **Controller:** `controllers/notificationController.js`

| Status | Endpoint                            | Function               | Description                                                                        |
| :----- | :---------------------------------- | :--------------------- | :--------------------------------------------------------------------------------- |
| ✅     | `GET /api/notifications`            | `getUserNotifications` | Retrieves reminders, updates, and alerts for the authenticated user. _(Protected)_ |
| ✅     | `PATCH /api/notifications/:id/read` | `markAsRead`           | Marks a specific push notification/alert as read by the user. _(Protected)_        |

### 7. Moderation & Reports Module

**Router:** `routes/reportRoutes.js` | **Controller:** `controllers/reportController.js`

| Status | Endpoint                         | Function          | Description                                                                                                  |
| :----- | :------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------- |
| ✅     | `POST /api/events/:id/report`    | `createReport`    | Allows a Registered User to flag an inappropriate event for moderation. _(Protected)_                        |
| ✅     | `GET /api/reports`               | `getAdminReports` | Allows an Admin to review all submitted moderation reports. _(Protected: Admin only)_                        |
| ✅     | `PATCH /api/reports/:id/resolve` | `resolveReport`   | Marks a report as resolved after an Admin takes action (e.g., removing the event). _(Protected: Admin only)_ |

### 8. System Audit & Logs

**Router:** `routes/adminRoutes.js` | **Controller:** `controllers/adminController.js`

| Status | Endpoint               | Function       | Description                                                                                                          |
| :----- | :--------------------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| ⬜     | `GET /api/admin/audit` | `getAuditLogs` | Retrieves system activity logs for admins to monitor actions (event deletions, user bans). _(Protected: Admin only)_ |
