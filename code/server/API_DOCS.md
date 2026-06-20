# LoneWolf API — Documentation

Full API for the LoneWolf event platform. Each request has a description of what it does, and saved example responses (success + relevant error cases) so you can see the expected result without running the request yourself.

Workflow: Register -> Login (auto-saves {{token}} and {{userId}}) -> Create Event (auto-saves {{eventId}}) -> everything else.

## Base URL

```
http://localhost:5000
```

Authenticated routes require an `Authorization: Bearer <token>` header, obtained from `POST /api/auth/login`.

---

## Auth Module

### `POST` http://localhost:5000/api/auth/register

**Register**

Creates a new Registered User. Hashes the password with bcrypt before storing it. Fails with 400 if the email is already in use, or if name/email/password fail validation (e.g. password under 6 characters).

**Example request body:**
```json
{
  "name": "Alex Wilson",
  "email": "alex@test.com",
  "password": "mypassword123"
}
```

**Example responses:**

- ✅ **201 - Created**
```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "Alex Wilson",
  "email": "alex@test.com",
  "role": "user"
}
```

- ⚠️ **400 - Validation error**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Password must be at least 6 characters",
      "path": "password",
      "location": "body"
    }
  ]
}
```

- ⚠️ **400 - Email already in use**
```json
{
  "message": "Email already in use"
}
```

---

### `POST` http://localhost:5000/api/auth/login

**Login**

Authenticates a user and returns a signed JWT (valid 7 days). On success, this request's test script automatically saves the token into {{token}} and the user id into {{userId}} for use by every other protected request in this collection.

**Example request body:**
```json
{
  "email": "alex@test.com",
  "password": "mypassword123"
}
```

**Example responses:**

- ✅ **200 - OK**
```json
{
  "token": "<jwt-returned-here>",
  "user": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Alex Wilson",
    "email": "alex@test.com",
    "role": "user"
  }
}
```

- ⚠️ **401 - Invalid credentials**
```json
{
  "message": "Invalid credentials"
}
```

---

## User Module

### `GET` http://localhost:5000/api/users/me

**Get My Profile**

Returns the profile of whoever owns the Bearer token (password field excluded). Protected - requires a valid token.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "Alex Wilson",
  "email": "alex@test.com",
  "role": "user",
  "interests": [],
  "isBanned": false,
  "createdAt": "2026-06-20T10:00:00.000Z",
  "updatedAt": "2026-06-20T10:00:00.000Z"
}
```

- ⚠️ **401 - No token**
```json
{
  "message": "Not authorized, no token"
}
```

---

### `GET` http://localhost:5000/api/users

**Get All Users (admin)**

Lists every registered user (password excluded). Protected: the caller's JWT must have role 'admin', enforced by the adminOnly middleware.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
[
  {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Alex Wilson",
    "email": "alex@test.com",
    "role": "user",
    "isBanned": false
  }
]
```

- ⚠️ **403 - Not an admin**
```json
{
  "message": "Admin access only"
}
```

---

### `PATCH` http://localhost:5000/api/users/{{userId}}/suspend

**Suspend User (admin)**

Sets isBanned = true on the target user and writes a USER_BANNED entry to the audit log (visible via GET /api/admin/audit). Protected: admin only.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "message": "User suspended",
  "id": "665f1a2b3c4d5e6f7a8b9c0d"
}
```

- ⚠️ **404 - User not found**
```json
{
  "message": "User not found"
}
```

---

## Event Module

### `GET` http://localhost:5000/api/events

**Get All Events**

Lists events. Public - no auth required. Supports optional query filters: ?category=, ?start=, ?end= (ISO dates), filtering on the startTime field.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f2a2b3c4d5e6f7a8b9c0e",
      "title": "Board Game Night",
      "category": "Gaming",
      "hostId": "665f1a2b3c4d5e6f7a8b9c0d",
      "startTime": "2026-07-01T18:00:00.000Z",
      "endTime": "2026-07-01T21:00:00.000Z",
      "location": {
        "lat": 32.0853,
        "lng": 34.7818
      },
      "capacity": 6,
      "participants": []
    }
  ]
}
```

---

### `GET` http://localhost:5000/api/events/nearby?lat=32.0853&lng=34.7818&radius=10

**Get Nearby Events**

Finds events within `radius` km of (lat, lng) using the Haversine formula, limited to events that haven't ended yet. Public. Defaults radius to 10km if omitted. Returns 400 if lat/lng are missing or not numbers.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f2a2b3c4d5e6f7a8b9c0e",
      "title": "Board Game Night",
      "location": {
        "lat": 32.0853,
        "lng": 34.7818
      },
      "distance": 0
    }
  ]
}
```

- ⚠️ **400 - Missing coordinates**
```json
{
  "success": false,
  "message": "Please provide valid lat and lng query parameters."
}
```

---

### `GET` http://localhost:5000/api/events/{{eventId}}

**Get Event By Id**

Fetches a single event by id. Public. Returns 404 if the id doesn't exist, 400 if the id isn't a valid Mongo ObjectId.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "_id": "665f2a2b3c4d5e6f7a8b9c0e",
  "title": "Board Game Night",
  "category": "Gaming",
  "hostId": "665f1a2b3c4d5e6f7a8b9c0d",
  "startTime": "2026-07-01T18:00:00.000Z",
  "endTime": "2026-07-01T21:00:00.000Z",
  "location": {
    "lat": 32.0853,
    "lng": 34.7818
  },
  "capacity": 6,
  "participants": []
}
```

- ⚠️ **404 - Not found**
```json
{
  "message": "Event not found"
}
```

---

### `POST` http://localhost:5000/api/events

**Create Event**

Publishes a new event. Protected - hostId is taken from the verified JWT, never from the request body. On success, this request's test script saves the new event's id into {{eventId}}. Returns 400 on validation failure (bad dates, endTime before startTime, out-of-range coordinates).

**Example request body:**
```json
{
  "title": "Board Game Night",
  "category": "Gaming",
  "startTime": "2026-07-01T18:00:00.000Z",
  "endTime": "2026-07-01T21:00:00.000Z",
  "location": { "lat": 32.0853, "lng": 34.7818 },
  "capacity": 6
}
```

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **201 - Created**
```json
{
  "success": true,
  "data": {
    "_id": "665f2a2b3c4d5e6f7a8b9c0e",
    "title": "Board Game Night",
    "category": "Gaming",
    "hostId": "665f1a2b3c4d5e6f7a8b9c0d",
    "startTime": "2026-07-01T18:00:00.000Z",
    "endTime": "2026-07-01T21:00:00.000Z",
    "location": {
      "lat": 32.0853,
      "lng": 34.7818
    },
    "capacity": 6,
    "participants": []
  }
}
```

- ⚠️ **400 - Validation error**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "endTime must be after startTime",
      "path": "endTime",
      "location": "body"
    }
  ]
}
```

---

### `PATCH` http://localhost:5000/api/events/{{eventId}}

**Update Event (host only)**

Partially updates an event. Protected - only the event's own host (hostId matches the caller's id) may update it. Any field omitted from the body is left unchanged.

**Example request body:**
```json
{
  "capacity": 8
}
```

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "data": {
    "_id": "665f2a2b3c4d5e6f7a8b9c0e",
    "title": "Board Game Night",
    "capacity": 8
  }
}
```

- ⚠️ **403 - Not the host**
```json
{
  "message": "Only the host can update this event"
}
```

---

### `DELETE` http://localhost:5000/api/events/{{eventId}}

**Delete Event (host/admin)**

Deletes an event. Protected - allowed for the event's host, or for any admin. Writes an EVENT_DELETED entry to the audit log on success.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "message": "Event deleted"
}
```

- ⚠️ **403 - Not authorized**
```json
{
  "message": "Only the host or an admin can delete this event"
}
```

---

### `POST` http://localhost:5000/api/events/{{eventId}}/join

**Join Event**

Reserves a spot for the caller in the event's participants list. Protected. Capacity and duplicate-join checks happen in one atomic findOneAndUpdate, so two simultaneous join requests can't both slip past a 'still has room' check. Returns 400 if already joined or if the event is full.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "data": {
    "_id": "665f2a2b3c4d5e6f7a8b9c0e",
    "capacity": 6,
    "participants": [
      "665f1a2b3c4d5e6f7a8b9c0d"
    ]
  }
}
```

- ⚠️ **400 - Event is full**
```json
{
  "message": "Event is full"
}
```

---

### `DELETE` http://localhost:5000/api/events/{{eventId}}/join

**Leave Event**

Removes the caller from the event's participants list. Protected. Safe to call even if the user wasn't a participant - $pull is a no-op in that case.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "data": {
    "_id": "665f2a2b3c4d5e6f7a8b9c0e",
    "capacity": 6,
    "participants": []
  }
}
```

- ⚠️ **404 - Event not found**
```json
{
  "message": "Event not found"
}
```

---

### `GET` http://localhost:5000/api/events/{{eventId}}/calendar

**Export Event to Calendar**

Generates a downloadable .ics file for the event (Content-Type: text/calendar) so it can be imported into Google/Apple/Outlook calendars. Public.

**Example responses:**

- ✅ **200 - OK (.ics file)**
```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LoneWolf//Events//EN
BEGIN:VEVENT
UID:665f2a2b3c4d5e6f7a8b9c0e@lonewolf
DTSTAMP:20260620T180000Z
DTSTART:20260701T180000Z
DTEND:20260701T210000Z
SUMMARY:Board Game Night
END:VEVENT
END:VCALENDAR
```

- ⚠️ **404 - Event not found**
```json
{
  "message": "Event not found"
}
```

---

## Report Module

### `POST` http://localhost:5000/api/events/{{eventId}}/report

**Create Report**

Flags an event for moderation. Protected - any registered user can report an event they think is inappropriate. On success, saves the new report's id into {{reportId}}.

**Example request body:**
```json
{
  "reason": "This event location seems fake"
}
```

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **201 - Created**
```json
{
  "_id": "665f3a2b3c4d5e6f7a8b9c0f",
  "reporterId": "665f1a2b3c4d5e6f7a8b9c0d",
  "eventId": "665f2a2b3c4d5e6f7a8b9c0e",
  "reason": "This event location seems fake",
  "status": "open",
  "resolvedBy": null
}
```

- ⚠️ **404 - Event not found**
```json
{
  "message": "Event not found"
}
```

---

### `GET` http://localhost:5000/api/reports

**Get Admin Reports (admin)**

Lists every moderation report, with the reporter's name/email and the reported event's title populated. Protected: admin only.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
[
  {
    "_id": "665f3a2b3c4d5e6f7a8b9c0f",
    "reporterId": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Alex Wilson",
      "email": "alex@test.com"
    },
    "eventId": {
      "_id": "665f2a2b3c4d5e6f7a8b9c0e",
      "title": "Board Game Night"
    },
    "reason": "This event location seems fake",
    "status": "open"
  }
]
```

- ⚠️ **403 - Not an admin**
```json
{
  "message": "Admin access only"
}
```

---

### `PATCH` http://localhost:5000/api/reports/{{reportId}}/resolve

**Resolve Report (admin)**

Marks a report as resolved and records which admin resolved it. Protected: admin only.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "_id": "665f3a2b3c4d5e6f7a8b9c0f",
  "status": "resolved",
  "resolvedBy": "665f1a2b3c4d5e6f7a8b9c0d"
}
```

- ⚠️ **404 - Report not found**
```json
{
  "message": "Report not found"
}
```

---

## Feedback Module

### `POST` http://localhost:5000/api/events/{{eventId}}/feedback

**Submit Feedback**

Leaves a 1-5 rating and optional comment for an event. Protected. A unique index on (eventId, userId) means a user can only leave feedback once per event - a second attempt returns 409.

**Example request body:**
```json
{
  "rating": 5,
  "comment": "Had a great time!"
}
```

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **201 - Created**
```json
{
  "_id": "665f4a2b3c4d5e6f7a8b9c10",
  "eventId": "665f2a2b3c4d5e6f7a8b9c0e",
  "userId": "665f1a2b3c4d5e6f7a8b9c0d",
  "rating": 5,
  "comment": "Had a great time!",
  "createdAt": "2026-06-20T18:00:00.000Z"
}
```

- ⚠️ **409 - Already submitted**
```json
{
  "message": "You have already submitted feedback for this event"
}
```

---

### `GET` http://localhost:5000/api/events/{{eventId}}/feedback

**Get Event Feedback**

Lists all feedback for an event, newest first, with the author's name populated. Public.

**Example responses:**

- ✅ **200 - OK**
```json
[
  {
    "_id": "665f4a2b3c4d5e6f7a8b9c10",
    "rating": 5,
    "comment": "Had a great time!",
    "userId": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Alex Wilson"
    }
  }
]
```

- ⚠️ **404 - Event not found**
```json
{
  "message": "Event not found"
}
```

---

## Notification Module

### `GET` http://localhost:5000/api/notifications

**Get My Notifications**

Lists the caller's own notifications, newest first. Protected - userId is taken from the JWT, so a user only ever sees their own.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f5a2b3c4d5e6f7a8b9c11",
      "userId": "665f1a2b3c4d5e6f7a8b9c0d",
      "message": "Your event starts in 1 hour",
      "type": "reminder",
      "read": false
    }
  ]
}
```

---

### `PATCH` http://localhost:5000/api/notifications/{{notificationId}}/read

**Mark Notification Read**

Sets read = true on one notification. Protected, with an ownership check - returns 403 if the notification belongs to a different user than the caller.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "data": {
    "_id": "665f5a2b3c4d5e6f7a8b9c11",
    "read": true
  }
}
```

- ⚠️ **403 - Not your notification**
```json
{
  "message": "You can only mark your own notifications as read"
}
```

---

## Admin Module

### `GET` http://localhost:5000/api/admin/audit

**Get Audit Logs (admin)**

Returns the full activity log (event deletions, user bans, etc.) with the acting admin's name/email populated. Protected: admin only.

> Requires `Authorization: Bearer {{token}}` header.

**Example responses:**

- ✅ **200 - OK**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f6a2b3c4d5e6f7a8b9c12",
      "actorId": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Alex Wilson",
        "email": "alex@test.com"
      },
      "action": "EVENT_DELETED",
      "targetId": "665f2a2b3c4d5e6f7a8b9c0e",
      "details": "Board Game Night"
    }
  ]
}
```

- ⚠️ **403 - Not an admin**
```json
{
  "message": "Admin access only"
}
```

---
