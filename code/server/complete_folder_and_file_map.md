# Server Architecture & API Endpoints

This document outlines the complete backend architecture, directory structure, and the exact mapping of API endpoints to their controller functions, fully aligned with the defined Use Cases and Entity roles.

**Status legend:** ✅ Done &nbsp;|&nbsp; 🚧 In progress / written but not wired+tested &nbsp;|&nbsp; ⬜ Not started

## 📂 Directory Structure

```text
/server
│   server.js                  ✅ Main server entry point / initialization file
│   .env                       ✅ Environment variables (Port, DB connection, Secret keys)
│   .gitignore                 ✅ Git ignore file (node_modules, .env)
│   package.json               ✅ npm configuration file ("type": "module")
│
├── /config                    # Configuration and external connections
│       db.js                  ✅ Database connection (MongoDB)
│
├── /models                    # Data schemas and models (Mongoose)
│       userModel.js           ✅ User model (name, email, password, role, isBanned)
│       eventModel.js          ⬜ Event model (title, date, capacity, geo-location, participants)
│       reportModel.js         ⬜ Report model (reported event/user, reason)
│       feedbackModel.js       ⬜ Feedback model (user rating and reviews for events)
│       notificationModel.js   ⬜ Notification model (push alerts, reminders)
│
├── /controllers               # Business logic and Database queries
│       authController.js      ✅ Registration and Login (Guest -> Registered User)
│       userController.js      ⬜ User management (Profile viewing, Admin suspending users)
│       eventController.js     ⬜ Full CRUD, complex queries (Discover, Filter, Join/Leave)
│       reportController.js    ⬜ Moderation and report handling
│       feedbackController.js  ⬜ Handling user feedback on attended events
│       notificationController.js ⬜ Managing and retrieving user notifications
│       adminController.js     ⬜ [NEW] System audit logs and overarching admin actions
│
├── /routes                    # API Endpoints mapped to controllers
│       authRoutes.js          ✅
│       userRoutes.js          ⬜
│       eventRoutes.js         ⬜
│       reportRoutes.js        ⬜
│       feedbackRoutes.js      ⬜
│       notificationRoutes.js  ⬜
│       adminRoutes.js         ⬜ [NEW]
│
├── /middleware                # Middleware functions
│       authMiddleware.js      🚧 JWT verification and Role checks (Admin vs User) — written, not yet wired to a live protected route
│       errorHandler.js        ⬜ Centralized error handler
│
└── /validators                # Input validation files (Joi / Express-Validator)
        authValidator.js       ⬜
        eventValidator.js      ⬜
```
