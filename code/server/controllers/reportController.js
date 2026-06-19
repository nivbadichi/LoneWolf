import Report from "../models/reportModel.js";
import { getEventById } from "../models/eventModel.js";

const createReport = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { reason } = req.body;

    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const report = await Report.create({
      reporterId: req.user.id,
      eventId,
      reason,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "name email")
      .populate("eventId", "title");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = "resolved";
    report.resolvedBy = req.user.id;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createReport, getAdminReports, resolveReport };
