import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

const Event = mongoose.model("Event", eventSchema);

// Pure data-access: takes an id, returns the matching document (or null).
// Knows nothing about HTTP — it could just as easily be called from a script.
async function getEventById(eventId) {
  return Event.findById(eventId);
}

export { Event, getEventById };
