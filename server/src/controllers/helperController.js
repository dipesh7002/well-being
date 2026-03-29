import { SharedAccess } from "../models/SharedAccess.js";

export async function getSharedEntries(req, res, next) {
  try {
    const sharedAccess = await SharedAccess.find({
      helperId: req.user._id,
      revokedAt: null
    })
      .populate({
        path: "userId",
        select: "fullName email"
      })
      .populate({
        path: "sharedEntryIds",
        match: { deletedAt: null },
        select: "entryDate text finalMood detectedMood sentimentScore createdAt"
      })
      .lean();

    return res.json({ sharedAccess });
  } catch (error) {
    next(error);
  }
}

export async function addHelperFeedback(req, res, next) {
  try {
    const { message } = req.body;
    const access = await SharedAccess.findOne({
      _id: req.params.id,
      helperId: req.user._id,
      revokedAt: null
    });

    if (!access) {
      return res.status(404).json({ message: "Shared access record not found." });
    }

    access.helperFeedback.push({
      helperId: req.user._id,
      message
    });
    await access.save();

    return res.json({
      message: "Supportive feedback saved.",
      access
    });
  } catch (error) {
    next(error);
  }
}

