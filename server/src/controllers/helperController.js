import { SharedAccess } from "../models/SharedAccess.js";

export async function getHelperStats(req, res, next) {
  try {
    const records = await SharedAccess.find({ helperId: req.user._id, revokedAt: null })
      .populate({ path: "sharedEntryIds", match: { deletedAt: null }, select: "entryDate finalMood" })
      .populate({ path: "userId", select: "fullName" })
      .lean();

    const totalUsers = records.length;
    const totalEntries = records.reduce((sum, r) => sum + (r.sharedEntryIds?.length || 0), 0);
    const totalFeedback = records.reduce((sum, r) => sum + (r.helperFeedback?.length || 0), 0);

    const recentEntries = records
      .flatMap((r) =>
        (r.sharedEntryIds || []).map((e) => ({ ...e, userName: r.userId?.fullName }))
      )
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
      .slice(0, 6);

    return res.json({ totalUsers, totalEntries, totalFeedback, recentEntries });
  } catch (error) {
    next(error);
  }
}

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

