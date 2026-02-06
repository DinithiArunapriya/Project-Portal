const { Settings } = require("../models/Settings");

async function getSettings(req, res) {
  const userId = req.user.id;
  let s = await Settings.findOne({ userId }).lean();
  if (!s) {
    s = await Settings.create({ userId });
    s = s.toObject();
  }
  res.json(s);
}

async function updateProfile(req, res) {
  const userId = req.user.id;
  const payload = req.body || {};
  const s = await Settings.findOneAndUpdate(
    { userId },
    { $set: { "profile": payload } },
    { upsert: true, new: true }
  ).lean();
  res.json(s.profile || {});
}

async function updateNotifications(req, res) {
  const userId = req.user.id;
  const payload = req.body || {};
  const s = await Settings.findOneAndUpdate(
    { userId },
    { $set: { "notifications": payload } },
    { upsert: true, new: true }
  ).lean();
  res.json(s.notifications || {});
}

async function updateAppearance(req, res) {
  const userId = req.user.id;
  const payload = req.body || {};
  const s = await Settings.findOneAndUpdate(
    { userId },
    { $set: { "appearance": payload } },
    { upsert: true, new: true }
  ).lean();
  res.json(s.appearance || {});
}

module.exports = { getSettings, updateProfile, updateNotifications, updateAppearance };
