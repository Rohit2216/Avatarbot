// const { db } = require("../services/firebaseAdmin");

// // ADD Switch to a Room
// const addSwitch = async (req, res) => {
//     const userId = req.user.uid;
//     const { roomId } = req.params;
//     const { switch_id, state, status } = req.body;

//     try {
//         const switchRef = db.ref(`${userId}/rooms/${roomId}/switches`);
//         const newSwitchRef = switchRef.push();
//         await newSwitchRef.set({ switch_id, state, status });
//         res.status(201).json({ message: "Switch added", switchId: newSwitchRef.key });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // UPDATE Switch
// const updateSwitch = async (req, res) => {
//     const userId = req.user.uid;
//     const { roomId, switchId } = req.params;
//     const { state, status, consumption } = req.body;

//     try {
//         await db.ref(`${userId}/rooms/${roomId}/switches/${switchId}`).update({
//             state,
//             status,
//             consumption
//         });
//         res.status(200).json({ message: "Switch updated" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // DELETE Switch
// const deleteSwitch = async (req, res) => {
//     const userId = req.user.uid;
//     const { roomId, switchId } = req.params;
//     if (!roomId && !switchId) {
//         return res.status(501).json({ message: "room id and switch id is missing." })
//     }
//     try {
//         await db.ref(`${userId}/rooms/${roomId}/switches/${switchId}`).remove();
//         res.status(200).json({ message: "Switch deleted" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = {
//     addSwitch,
//     updateSwitch,
//     deleteSwitch
// };


const { db } = require("../services/firebaseAdmin");

// GET All Switches for a Room
const getSwitches = async (req, res) => {
  const userId = req.user.uid;
  const { roomId } = req.params;

  try {
    const snapshot = await db.ref(`${userId}/rooms/${roomId}/switches`).once("value");
    res.status(200).json(snapshot.val() || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD Switch to a Room
const addSwitch = async (req, res) => {
  const userId = req.user.uid;
  const { roomId } = req.params;
  const { switch_id, state, status } = req.body;

  try {
    const switchRef = db.ref(`${userId}/rooms/${roomId}/switches`);
    const newSwitchRef = switchRef.push();

    const switchData = { switch_id, state, status };
    // if (consumption !== undefined) {
    //   switchData.consumption = consumption;
    // }

    await newSwitchRef.set(switchData);
    res.status(201).json({ message: "Switch added", switchId: newSwitchRef.key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH: Update Only Switch Name
const updateSwitchName = async (req, res) => {
  const userId = req.user.uid;
  const { roomId, switchId } = req.params;
  const { switch_id } = req.body;

  if (!switch_id) {
    return res.status(400).json({ error: "switch_id is required" });
  }

  try {
    await db.ref(`${userId}/rooms/${roomId}/switches/${switchId}`).update({ switch_id });
    res.status(200).json({ message: "Switch name updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH: Update Only Switch State
const updateSwitchState = async (req, res) => {
  const userId = req.user.uid;
  const { roomId, switchId } = req.params;
  const { state } = req.body;

  if (state === undefined) {
    return res.status(400).json({ error: "state is required" });
  }

  try {
    await db.ref(`${userId}/rooms/${roomId}/switches/${switchId}`).update({ state });
    res.status(200).json({ message: "Switch state updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE Switch
const deleteSwitch = async (req, res) => {
  const userId = req.user.uid;
  const { roomId, switchId } = req.params;

  try {
    await db.ref(`${userId}/rooms/${roomId}/switches/${switchId}`).remove();
    res.status(200).json({ message: "Switch deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSwitches,
  addSwitch,
  updateSwitchName,
  updateSwitchState,
  deleteSwitch
};
