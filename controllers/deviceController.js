const { db } = require("../services/firebaseAdmin");

const toggleDevice = async (req, res) => {
  const { roomId, deviceId, status } = req.body;
  try {
    await db.ref(`rooms/${roomId}/devices/${deviceId}`).update({ status });
    res.json({ message: "Device toggled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {toggleDevice}