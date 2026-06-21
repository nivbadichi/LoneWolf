import User from "../models/userModel.js";
import { createAuditLog } from "../models/auditLogModel.js";

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, interests } = req.body;
    if (name !== undefined) user.name = name;
    if (interests !== undefined) user.interests = interests;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBanned = true;
    await user.save();

    // Record who banned whom, so an admin can audit it later via
    // GET /api/admin/audit.
    await createAuditLog({
      actorId: req.user.id,
      action: "USER_BANNED",
      targetId: user._id,
      details: user.email,
    });

    res.status(200).json({ message: "User suspended", id: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getUserProfile, updateMyProfile, getAllUsers, suspendUser };
