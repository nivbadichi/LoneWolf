import { Event, getEventById as findEventById } from "../models/eventModel.js";
import { createAuditLog } from "../models/auditLogModel.js";

// GET /api/events/:id
// Controller never touches the database directly — it delegates to the
// model and focuses only on translating between HTTP and business logic.
async function getEventById(req, res, next) {
  try {
    const event = await findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    // Hand unexpected errors to the centralized error-handling middleware
    // instead of formatting an error response here.
    next(err);
  }
}

/**
 * GET /api/events
 * Retrieves events. Implements multi-filter logic (by category, start/end time) via query parameters.
 * Expected query formats: ?category=music & ?start=2026-06-01 & ?end=2026-06-30
 */
async function getAllEvents(req, res, next) {
  try {
    // 1. Extract query parameters
    const { category, start, end } = req.query;
    // 2. Initialize an empty filter object
    const queryFilter = {};
    // 3. Apply category filter (exact match based on schema definition)
    if (category) {
      queryFilter.category = category;
    }
    // 4. Apply start/end time filters
    // This targets the 'startTime' field in your specific Mongoose schema
    if (start || end) {
      queryFilter.startTime = {};
      // If a start time is provided, find events starting ON or AFTER this date
      if (start) {
        queryFilter.startTime.$gte = new Date(start);
      }
      // If an end time is provided, find events starting ON or BEFORE this date
      if (end) {
        queryFilter.startTime.$lte = new Date(end);
      }
    }
    // 5. Execute the query
    const events = await Event.find(queryFilter);
    // 6. Return standard JSON response
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    // 7. Pass any CastErrors (e.g., invalid date strings) to your error handler
    next(error);
  }
}

// Helper function: Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers. Change to 3959 for miles.
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Returns distance in kilometers
}

/**
 * GET /api/events/nearby
 * Discovers nearby events using Haversine proximity search.
 * Expected query: ?lat=32.0853&lng=34.7818&radius=10
 */
async function getNearbyEvents(req, res, next) {
  try {
    // 1. Extract parameters and convert them from strings to numbers
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10;
    // Default to 10km if no radius provided
    // 2. Validate inputs
    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid lat and lng query parameters.",
      });
    }
    // 3. Fetch active events (you usually only want nearby events that haven't ended)
    const now = new Date();
    const activeEvents = await Event.find({
      endTime: { $gte: now },
    });
    // 4. Filter events using the Haversine formula
    const nearbyEvents = activeEvents.filter((event) => {
      // Ensure the event has a location before calculating
      if (!event.location || !event.location.lat || !event.location.lng) {
        return false;
      }
      const distance = calculateDistance(userLat, userLng, event.location.lat, event.location.lng);
      // Attach the calculated distance to the event object for the frontend to use
      event._doc.distance = distance; // _doc is used to inject properties into Mongoose documents
      // Keep the event if it falls within the requested radius
      return distance <= radius;
    });
    // 5. Sort the results from closest to furthest
    nearbyEvents.sort((a, b) => a._doc.distance - b._doc.distance);
    // 6. Return the response
    res.status(200).json({
      success: true,
      count: nearbyEvents.length,
      data: nearbyEvents,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/events
 * Allows an authenticated Host to publish a new event. (Protected)
 */
async function createEvent(req, res, next) {
  try {
    const { title, category, startTime, endTime, location, capacity } = req.body;

    const event = await Event.create({
      title,
      category,
      startTime,
      endTime,
      location,
      capacity,
      hostId: req.user.id, // set from the verified JWT, never trust a hostId from the body
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/events/:id
 * Allows the Host who owns the event to modify it. (Protected: Host only)
 */
async function updateEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.hostId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the host can update this event" });
    }

    const { title, category, startTime, endTime, location, capacity } = req.body;
    if (title !== undefined) event.title = title;
    if (category !== undefined) event.category = category;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (location !== undefined) event.location = location;
    if (capacity !== undefined) event.capacity = capacity;

    await event.save();

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/events/:id
 * Allows the Host to cancel their own event, or an Admin to remove any event. (Protected)
 */
async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isHost = event.hostId.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isHost && !isAdmin) {
      return res.status(403).json({ message: "Only the host or an admin can delete this event" });
    }

    await event.deleteOne();

    // Record who deleted what, so an admin can audit it later via
    // GET /api/admin/audit.
    await createAuditLog({
      actorId: req.user.id,
      action: "EVENT_DELETED",
      targetId: event._id,
      details: event.title,
    });

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/events/:id/join
 * Reserves a place for the authenticated user. (Protected)
 * Capacity + duplicate-join checks happen in a single atomic update so two
 * simultaneous join requests can't both squeeze past a "still has room" check.
 */
async function joinEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.some((participantId) => participantId.toString() === req.user.id)) {
      return res.status(400).json({ message: "You have already joined this event" });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: event._id,
        participants: { $ne: req.user.id },
        $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
      },
      { $push: { participants: req.user.id } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ message: "Event is full" });
    }

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/events/:id/join
 * Removes the authenticated user from the event's participant list. (Protected)
 */
async function leaveEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $pull: { participants: req.user.id } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

// Formats a Date as the UTC basic format iCalendar requires, e.g. 20260619T140000Z
function toICSDate(date) {
  return new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * GET /api/events/:id/calendar
 * Generates an .ics file for the event so it can be imported into external calendars.
 */
async function exportToCalendar(req, res, next) {
  try {
    const event = await findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LoneWolf//Events//EN",
      "BEGIN:VEVENT",
      `UID:${event._id}@lonewolf`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(event.startTime)}`,
      `DTEND:${toICSDate(event.endTime)}`,
      `SUMMARY:${event.title}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", `attachment; filename="event-${event._id}.ics"`);
    res.status(200).send(ics);
  } catch (error) {
    next(error);
  }
}

export {
  getEventById,
  getAllEvents,
  getNearbyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  exportToCalendar,
};
