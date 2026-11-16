//// const { db } = require("../services/firebaseAdmin");
//
//
//// const createRoom = async (req, res) => {
////   const userId = req.user?.uid;
////   const { room_name, board_id, selected_devices } = req.body;
//
////   // 🔹 Basic validation
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized: userId missing" });
////   }
//
////   if (!room_name || !board_id) {
////     return res.status(400).json({ error: "Room name and board ID are required" });
////   }
//
////   try {
////     // 🔹 Check if user exists
////     const userRef = db.ref(`users/${userId}`);
////     const userSnap = await userRef.once("value");
//
////     if (!userSnap.exists()) {
////       return res.status(404).json({ error: "User not found" });
////     }
//
////     // 🔹 Check if board exists under users/{userId}/boards/{boardId}
////     const boardRef = db.ref(`users/${userId}/boards/${board_id}`);
////     const boardSnap = await boardRef.once("value");
//
////     if (!boardSnap.exists()) {
////       return res.status(404).json({ error: "Board not found" });
////     }
//
////     // 🔹 Prepare selected_devices in proper format
////     const formattedDevices = {};
//
////     if (selected_devices?.fans?.length) {
////       selected_devices.fans.forEach((fan) => {
////         formattedDevices[fan] = 0;
////         formattedDevices[`${fan}_Res`] = 0;
////       });
////     }
//
////     if (selected_devices?.switches?.length) {
////       selected_devices.switches.forEach((sw) => {
////         formattedDevices[sw] = 0;
////         formattedDevices[`${sw}_Res`] = 0;
////       });
////     }
//
////     // 🔹 Create new room under users/{userId}/rooms
////     const roomRef = db.ref(`users/${userId}/rooms`).push();
////     const roomData = {
////       room_name,
////       board_id,
////       selected_devices: formattedDevices,
////       created_at: new Date().toISOString(),
////     };
//
////     await roomRef.set(roomData);
//
////     // 🔹 Response
////     res.status(201).json({
////       message: "Room created successfully",
////       roomId: roomRef.key,
////       room: roomData,
////     });
//
////   } catch (error) {
////     console.error("Error creating room:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//
//
//// function getBaseDeviceNames(selectedDevices = {}) {
////     const bases = new Set();
//
////     for (const key of Object.keys(selectedDevices)) {
////         if (key.endsWith("_Res")) {
////             bases.add(key.slice(0, -4)); // remove "_Res"
////         } else {
////             bases.add(key);
////         }
////     }
//
////     return Array.from(bases);
//// }
//
//
//// const getRooms = async (req, res) => {
////     const userId = req.user?.uid;
//
////     if (!userId) {
////         return res.status(401).json({ error: "Unauthorized: userId missing" });
////     }
//
////     try {
////         const userRef = db.ref(`users/${userId}/rooms`);
////         const snapshot = await userRef.once("value");
////         const rooms = snapshot.val();
//
////         if (!rooms) {
////             return res.status(200).json({ message: "No rooms found", rooms: [] });
////         }
//
////         const roomList = Object.entries(rooms).map(([roomId, room]) => {
////             const selectedDevices = room.selected_devices || {};
//
////             // Get base devices (Fan_1, Switch_1, etc.)
////             const baseNames = getBaseDeviceNames(selectedDevices);
////             const totalDevices = baseNames.length;
//
////             // Count active devices based on _Res key = 1
////             let activeDevices = 0;
////             baseNames.forEach((base) => {
////                 const resKey = `${base}_Res`;
////                 if (selectedDevices[resKey] === 1 || selectedDevices[base] === 1) {
////                     activeDevices++;
////                 }
////             });
//
////             return {
////                 roomId,
////                 room_name: room.room_name || "Unnamed Room",
////                 board_id: room.board_id || "N/A",
////                 total_devices: totalDevices,
////                 active_devices: activeDevices,
////                 created_at: room.created_at || null,
////             };
////         });
//
////         res.status(200).json({
////             total_rooms: roomList.length,
////             rooms: roomList,
////         });
//
////     } catch (error) {
////         console.error("🔥 Error fetching rooms:", error);
////         res.status(500).json({ error: error.message });
////     }
//// };
//
//
//// const getRoom = async (req, res) => {
////     const userId = req.user?.uid;
////     const { roomId } = req.params;
//
////     if (!userId) {
////         return res.status(401).json({ error: "Unauthorized: userId missing" });
////     }
//
////     try {
////         const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////         const snapshot = await roomRef.once("value");
////         const room = snapshot.val();
//
////         if (!room) {
////             return res.status(404).json({ error: "Room not found" });
////         }
//
////         const selectedDevices = room.selected_devices || {};
////         const baseNames = getBaseDeviceNames(selectedDevices);
////         const totalDevices = baseNames.length;
//
////         let activeDevices = 0;
////         baseNames.forEach((base) => {
////             const resKey = `${base}_Res`;
////             if (selectedDevices[resKey] === 1 || selectedDevices[base] === 1) {
////                 activeDevices++;
////             }
////         });
//
////         const result = {
////             roomId,
////             room_name: room.room_name || "Unnamed Room",
////             board_id: room.board_id || "N/A",
////             selected_devices: selectedDevices,
////             total_devices: totalDevices,
////             active_devices: activeDevices,
////             created_at: room.created_at || null,
////         };
//
////         res.status(200).json(result);
//
////     } catch (error) {
////         console.error("🔥 Error fetching room:", error);
////         res.status(500).json({ error: error.message });
////     }
//// };
//
//
//// const updateRoom = async (req, res) => {
////   const userId = req.user?.uid;
////   const { roomId } = req.params;
////   const { room_name, board_id, selected_devices } = req.body;
//
////   // 🔹 Basic validation
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized: userId missing" });
////   }
//
////   if (!roomId) {
////     return res.status(400).json({ error: "Room ID is required" });
////   }
//
////   if (!room_name || !board_id) {
////     return res.status(400).json({ error: "Room name and board ID are required" });
////   }
//
////   try {
////     // 🔹 Check Room Exists
////     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////     const roomSnap = await roomRef.once("value");
//
////     if (!roomSnap.exists()) {
////       return res.status(404).json({ error: "Room not found" });
////     }
//
////     // 🔹 Check Board Exists
////     const boardRef = db.ref(`users/${userId}/boards/${board_id}`);
////     const boardSnap = await boardRef.once("value");
//
////     if (!boardSnap.exists()) {
////       return res.status(404).json({ error: "Board not found" });
////     }
//
////     // 🔹 Format selected devices again
////     const formattedDevices = {};
//
////     if (selected_devices?.fans?.length) {
////       selected_devices.fans.forEach((fan) => {
////         formattedDevices[fan] = 0;
////         formattedDevices[`${fan}_Res`] = 0;
////       });
////     }
//
////     if (selected_devices?.switches?.length) {
////       selected_devices.switches.forEach((sw) => {
////         formattedDevices[sw] = 0;
////         formattedDevices[`${sw}_Res`] = 0;
////       });
////     }
//
////     // 🔹 Update room data
////     const updatedRoom = {
////       ...roomSnap.val(),
////       room_name,
////       board_id,
////       selected_devices: formattedDevices,
////       updated_at: new Date().toISOString(),
////     };
//
////     await roomRef.set(updatedRoom);
//
////     res.status(200).json({
////       message: "Room updated successfully",
////       roomId,
////       room: updatedRoom,
////     });
//
////   } catch (error) {
////     console.error("Error updating room:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//
//// // DELETE Room
//
//// const deleteRoom = async (req, res) => {
////   const userId = req.user?.uid;
////   const { roomId } = req.params;
//
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized: userId missing" });
////   }
//
////   if (!roomId) {
////     return res.status(400).json({ error: "Room ID is required" });
////   }
//
////   try {
////     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////     const roomSnap = await roomRef.once("value");
//
////     if (!roomSnap.exists()) {
////       return res.status(404).json({ error: "Room not found" });
////     }
//
////     await roomRef.remove();
//
////     res.status(200).json({
////       message: "Room deleted successfully",
////       roomId,
////     });
//
////   } catch (error) {
////     console.error("Error deleting room:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//
//// // ✅ UPDATE DEVICE STATE (Fan/Switch inside a room)
//// const updateDeviceStates = async (req, res) => {
////     const userId = req.user?.uid;
////     const { roomId } = req.params; // e.g., /api/rooms/:roomId/device
////     const { deviceName, state } = req.body; // e.g., { "deviceName": "Fan_1_Res", "state": 1 }
//
////     // 🟡 Basic Validation
////     if (!userId) {
////         return res.status(401).json({ error: "Unauthorized: userId missing" });
////     }
//
////     if (!deviceName || typeof state !== "number") {
////         return res.status(400).json({ error: "deviceName and numeric state are required" });
////     }
//
////     try {
////         // 1️⃣ Fetch room reference
////         const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////         const roomSnapshot = await roomRef.once("value");
//
////         if (!roomSnapshot.exists()) {
////             return res.status(404).json({ error: "Room not found" });
////         }
//
////         const roomData = roomSnapshot.val();
////         const selectedDevices = roomData.selected_devices || {};
//
////         // 2️⃣ Check if device exists in selected_devices
////         if (!Object.prototype.hasOwnProperty.call(selectedDevices, deviceName)) {
////             return res.status(404).json({ error: `Device '${deviceName}' not found in this room` });
////         }
//
////         // 3️⃣ Update the specific device state
////         await db.ref(`users/${userId}/rooms/${roomId}/selected_devices/${deviceName}`).set(state);
//
////         // 4️⃣ Return success with updated data
////         return res.status(200).json({
////             message: `Device '${deviceName}' state updated successfully`,
////             roomId,
////             deviceName,
////             newState: state,
////         });
////     } catch (error) {
////         console.error("🔥 Error updating device state:", error);
////         res.status(500).json({ error: error.message });
////     }
//// };
//
//
//// module.exports = {
////   createRoom,
////   getRooms,
////   getRoom,
////   updateRoom,
////   deleteRoom,
////   updateDeviceStates
//// };
//
//
//// const { db } = require("../services/firebaseAdmin");
//
///* ================================
//   CREATE ROOM
//================================ */
//const { db } = require("../services/firebaseAdmin");
//
//// const createRoom = async (req, res) => {
////   const userId = req.user?.uid;
////   const { room_name, board_id, devices } = req.body;
//
////   // 🔹 Basic validation
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized: userId missing" });
////   }
//
////   if (!room_name || !board_id || !Array.isArray(devices) || devices.length === 0) {
////     return res.status(400).json({
////       error: "room_name, board_id and devices array are required",
////     });
////   }
//
////   try {
////     // 🔹 Check if user exists
////     const userRef = db.ref(`users/${userId}`);
////     const userSnap = await userRef.once("value");
//
////     if (!userSnap.exists()) {
////       return res.status(404).json({ error: "User not found" });
////     }
//
////     // 🔹 Check if board exists
////     const boardRef = db.ref(`users/${userId}/${board_id}`);
////     const boardSnap = await boardRef.once("value");
//
////     if (!boardSnap.exists()) {
////       return res.status(404).json({ error: "Board not found" });
////     }
//
////     // 🔹 Validate selected devices exist in board
////     const boardData = boardSnap.val();
////     const validDevices = devices.filter(
////       (d) => boardData.hasOwnProperty(d)
////     );
//
////     if (validDevices.length !== devices.length) {
////       return res.status(400).json({
////         error: "One or more selected devices do not exist on this board",
////       });
////     }
//
////     // 🔹 Create room (MAPPING ONLY)
////     const roomRef = db.ref(`users/${userId}/rooms`).push();
////     const roomData = {
////       room_name,
////       board_id,
////       devices: validDevices,
////       created_at: new Date().toISOString(),
////     };
//
////     await roomRef.set(roomData);
//
////     return res.status(201).json({
////       message: "Room created successfully",
////       roomId: roomRef.key,
////       room: roomData,
////     });
//
////   } catch (error) {
////     console.error("🔥 Error creating room:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//const createRoom = async (req, res) => {
//  const userId = req.user?.uid;
//  const { room_name, board_id, devices } = req.body;
//
//  if (!userId) return res.status(401).json({ error: "Unauthorized" });
//
//  if (!room_name || !board_id || !Array.isArray(devices) || !devices.length) {
//    return res.status(400).json({ error: "room_name, board_id, devices required" });
//  }
//
//  try {
//    const boardRef = db.ref(`users/${userId}/${board_id}`);
//    const boardSnap = await boardRef.once("value");
//
//    if (!boardSnap.exists()) {
//      return res.status(404).json({ error: "Board not found" });
//    }
//
//    const boardData = boardSnap.val();
//
//    const validDevices = devices.filter(d => boardData.hasOwnProperty(d));
//
//    if (validDevices.length !== devices.length) {
//      return res.status(400).json({ error: "Invalid device in list" });
//    }
//
//    const roomRef = db.ref(`users/${userId}/rooms`).push();
//
//    const roomData = {
//      room_name,
//      board_id,
//      devices: validDevices,
//      created_at: new Date().toISOString(),
//    };
//
//    await roomRef.set(roomData);
//
//    res.status(201).json({ message: "Room created", roomId: roomRef.key, room: roomData });
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: err.message });
//  }
//};
//
//
///* ================================
//   GET ALL ROOMS
//================================ */
//// const getRooms = async (req, res) => {
////   const userId = req.user?.uid;
//
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized: userId missing" });
////   }
//
////   try {
////     const roomsRef = db.ref(`users/${userId}/rooms`);
////     const snapshot = await roomsRef.once("value");
//
////     if (!snapshot.exists()) {
////       return res.status(200).json({ total_rooms: 0, rooms: [] });
////     }
//
////     const rooms = snapshot.val();
//
////     const roomList = Object.entries(rooms).map(([roomId, room]) => {
////       const selectedDevices = room.selected_devices || {};
//
////       const baseDevices = new Set();
////       Object.keys(selectedDevices).forEach((key) => {
////         if (key.endsWith("_Res")) {
////           baseDevices.add(key.replace("_Res", ""));
////         } else {
////           baseDevices.add(key);
////         }
////       });
//
////       let activeDevices = 0;
////       baseDevices.forEach((device) => {
////         if (
////           selectedDevices[`${device}_Res`] === 1 ||
////           selectedDevices[device] === 1
////         ) {
////           activeDevices++;
////         }
////       });
//
////       return {
////         roomId,
////         room_name: room.room_name,
////         board_id: room.board_id,
////         total_devices: baseDevices.size,
////         active_devices: activeDevices,
////         created_at: room.created_at || null,
////       };
////     });
//
////     res.status(200).json({
////       total_rooms: roomList.length,
////       rooms: roomList,
////     });
//
////   } catch (error) {
////     console.error("🔥 Error fetching rooms:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//
//const getRooms = async (req, res) => {
//  const userId = req.user?.uid;
//  if (!userId) return res.status(401).json({ error: "Unauthorized" });
//
//  try {
//    const roomsSnap = await db.ref(`users/${userId}/rooms`).once("value");
//
//    if (!roomsSnap.exists()) {
//      return res.json({ total_rooms: 0, rooms: [] });
//    }
//
//    const rooms = roomsSnap.val();
//    const result = [];
//
//    for (const [roomId, room] of Object.entries(rooms)) {
//
//      const boardSnap = await db.ref(`users/${userId}/${room.board_id}`).once("value");
//      const board = boardSnap.val() || {};
//
//      let active = 0;
//  // ✅ SAFE CHECK
//      const devices = Array.isArray(room.devices) ? room.devices : [];
//      devices.forEach(d => {
//        if (board[`${d}_Res`] === 1) active++;
//      });
//
//      result.push({
//        roomId,
//        room_name: room.room_name,
//        board_id: room.board_id,
//        total_devices: devices.length,
//        active_devices: active,
//        created_at: room.created_at || null
//      });
//    }
//
//    res.json({ total_rooms: result.length, rooms: result });
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: err.message });
//  }
//};
//
//
///* ================================
//   GET SINGLE ROOM
//================================ */
//// const getRoom = async (req, res) => {
////   const userId = req.user?.uid;
////   const { roomId } = req.params;
//
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized" });
////   }
//
////   try {
////     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////     const snapshot = await roomRef.once("value");
//
////     if (!snapshot.exists()) {
////       return res.status(404).json({ error: "Room not found" });
////     }
//
////     const room = snapshot.val();
////     const selectedDevices = room.selected_devices || {};
//
////     const baseDevices = new Set();
////     Object.keys(selectedDevices).forEach((key) => {
////       if (key.endsWith("_Res")) {
////         baseDevices.add(key.replace("_Res", ""));
////       } else {
////         baseDevices.add(key);
////       }
////     });
//
////     let activeDevices = 0;
////     baseDevices.forEach((device) => {
////       if (
////         selectedDevices[`${device}_Res`] === 1 ||
////         selectedDevices[device] === 1
////       ) {
////         activeDevices++;
////       }
////     });
//
////     res.status(200).json({
////       roomId,
////       room_name: room.room_name,
////       board_id: room.board_id,
////       selected_devices: selectedDevices,
////       total_devices: baseDevices.size,
////       active_devices: activeDevices,
////       created_at: room.created_at || null,
////     });
//
////   } catch (error) {
////     console.error(" Error fetching room:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//const getRoomById = async (req, res) => {
//  const userId = req.user?.uid;
//  const { roomId } = req.params;
//
//  if (!userId) return res.status(401).json({ error: "Unauthorized" });
//
//  try {
//    const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
//
//    if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });
//
//    const room = roomSnap.val();
//
//    const boardSnap = await db.ref(`users/${userId}/${room.board_id}`).once("value");
//    if (!boardSnap.exists()) return res.status(404).json({ error: "Board not found" });
//
//    const board = boardSnap.val();
//
//    const devices = {};
//
//    // room.devices.forEach(d => {
//    //   devices[d] = {
//    //     command: board[d],
//    //     status: board[`${d}_Res`]
//    //   };
//    // });
//
//     let active = 0;
//
//    // SAFE CHECK
//    const roomDevices = Array.isArray(room.devices) ? room.devices : [];
//
//    roomDevices.forEach(d => {
//      const status = board[`${d}_Res`];
//
//      if (status === 1) active++;
//
//      devices[d] = {
//        command: board[d] ?? 0,
//        status: status ?? 0
//      };
//    });
//
//    res.json({
//      roomId,
//      room_name: room.room_name,
//      board_id: room.board_id,
//      devices,
//      total_devices: room.devices.length,
//      active_devices: active,
//      created_at: room.created_at || null
//    });
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: err.message });
//  }
//};
//
///* ================================
//   UPDATE ROOM
//================================ */
//// const updateRoom = async (req, res) => {
////   const userId = req.user?.uid;
////   const { roomId } = req.params;
////   const { room_name, board_id, selected_devices } = req.body;
//
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized" });
////   }
//
////   try {
////     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////     const roomSnap = await roomRef.once("value");
//
////     if (!roomSnap.exists()) {
////       return res.status(404).json({ error: "Room not found" });
////     }
//
////     // Validate board
////     const boardRef = db.ref(`users/${userId}/${board_id}`);
////     const boardSnap = await boardRef.once("value");
//
////     if (!boardSnap.exists()) {
////       return res.status(404).json({ error: "Board not found" });
////     }
//
////     const formattedDevices = {};
//
////     if (selected_devices?.fans) {
////       selected_devices.fans.forEach((fan) => {
////         formattedDevices[fan] = 0;
////         formattedDevices[`${fan}_Res`] = 0;
////       });
////     }
//
////     if (selected_devices?.switches) {
////       selected_devices.switches.forEach((sw) => {
////         formattedDevices[sw] = 0;
////         formattedDevices[`${sw}_Res`] = 0;
////       });
////     }
//
////     const updatedRoom = {
////       ...roomSnap.val(),
////       room_name,
////       board_id,
////       selected_devices: formattedDevices,
////       updated_at: new Date().toISOString(),
////     };
//
////     await roomRef.set(updatedRoom);
//
////     res.status(200).json({
////       message: "Room updated successfully",
////       roomId,
////       room: updatedRoom,
////     });
//
////   } catch (error) {
////     console.error("Error updating room:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//
//const updateRoom = async (req, res) => {
//  const userId = req.user?.uid;
//  const { roomId } = req.params;
//  const { room_name, board_id, devices } = req.body;
//
//  if (!userId) return res.status(401).json({ error: "Unauthorized" });
//
//  try {
//    const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
//    const roomSnap = await roomRef.once("value");
//
//    if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });
//
//    const boardSnap = await db.ref(`users/${userId}/${board_id}`).once("value");
//    if (!boardSnap.exists()) return res.status(404).json({ error: "Board not found" });
//
//    const board = boardSnap.val();
//    const validDevices = devices.filter(d => board.hasOwnProperty(d));
//
//    if (validDevices.length !== devices.length) {
//      return res.status(400).json({ error: "Invalid device in list" });
//    }
//
//    const updated = {
//      ...roomSnap.val(),
//      room_name,
//      board_id,
//      devices: validDevices,
//      updated_at: new Date().toISOString()
//    };
//
//    await roomRef.set(updated);
//
//    res.json({ message: "Room updated", roomId, room: updated });
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: err.message });
//  }
//};
//
//
///* ================================
//   DELETE ROOM
//================================ */
//// const deleteRoom = async (req, res) => {
////   const userId = req.user?.uid;
////   const { roomId } = req.params;
//
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized" });
////   }
//
////   try {
////     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////     const snapshot = await roomRef.once("value");
//
////     if (!snapshot.exists()) {
////       return res.status(404).json({ error: "Room not found" });
////     }
//
////     await roomRef.remove();
//
////     res.status(200).json({
////       message: "Room deleted successfully",
////       roomId,
////     });
//
////   } catch (error) {
////     console.error("Error deleting room:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//const deleteRoom = async (req, res) => {
//  const userId = req.user?.uid;
//  const { roomId } = req.params;
//
//  if (!userId) return res.status(401).json({ error: "Unauthorized" });
//
//  try {
//    const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
//    const snap = await roomRef.once("value");
//
//    if (!snap.exists()) return res.status(404).json({ error: "Room not found" });
//
//    await roomRef.remove();
//
//    res.json({ message: "Room deleted", roomId });
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: err.message });
//  }
//};
//
///* ================================
//   UPDATE DEVICE STATE
//================================ */
//// const updateDeviceStates = async (req, res) => {
////   const userId = req.user?.uid;
////   const { roomId } = req.params;
////   const { deviceName, state } = req.body;
//
////   if (!userId) {
////     return res.status(401).json({ error: "Unauthorized" });
////   }
//
////   if (!deviceName || typeof state !== "number") {
////     return res.status(400).json({ error: "Invalid device update request" });
////   }
//
////   try {
////     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
////     const roomSnap = await roomRef.once("value");
//
////     if (!roomSnap.exists()) {
////       return res.status(404).json({ error: "Room not found" });
////     }
//
////     const selectedDevices = roomSnap.val().selected_devices || {};
//
////     if (!selectedDevices.hasOwnProperty(deviceName)) {
////       return res.status(404).json({ error: "Device not found in room" });
////     }
//
////     await db
////       .ref(`users/${userId}/rooms/${roomId}/selected_devices/${deviceName}`)
////       .set(state);
//
////     res.status(200).json({
////       message: "Device state updated successfully",
////       deviceName,
////       state,
////     });
//
////   } catch (error) {
////     console.error("Error updating device state:", error);
////     res.status(500).json({ error: error.message });
////   }
//// };
//
//
////const updateDeviceStates = async (req, res) => {
////  const userId = req.user?.uid;
////  const { roomId } = req.params;
////  const { deviceName, state } = req.body;
////
////  console.log("Update Device State Request:", { userId, roomId, deviceName, state });
////
////  if (!userId) return res.status(401).json({ error: "Unauthorized" });
////
////  try {
////    const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
////    if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });
////
////    const room = roomSnap.val();
////    console.log("Room Data:", room);
////    if (!room.devices.includes(deviceName)) {
////      return res.status(404).json({ error: "Device not in room" });
////    }
////
////    await db.ref(`users/${userId}/${room.board_id}/${deviceName}`).set(state);
////
////    res.json({ message: "Command sent to board", deviceName, state });
////
////  } catch (err) {
////    console.error(err);
////    res.status(500).json({ error: err.message });
////  }
////};
//
//const updateDeviceStates = async (req, res) => {
//  const userId = req.user?.uid;
//  const { roomId } = req.params;
//  const { deviceName, state } = req.body;
//
//  if (!userId) return res.status(401).json({ error: "Unauthorized" });
//
//  try {
//    const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
//    if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });
//
//    const room = roomSnap.val();
//
//    if (!room.devices.includes(deviceName)) {
//      return res.status(404).json({ error: "Device not in room" });
//    }
//
//    const deviceRef = db.ref(`users/${userId}/${room.board_id}/${deviceName}`);
//    const deviceResRef = db.ref(`users/${userId}/${room.board_id}/${deviceName}_Res`);
//
//    // 🔹 1. Read old state
//    const oldStateSnap = await deviceRef.once("value");
//    const oldState = oldStateSnap.val();
//
//    // 🔹 2. Send new command
//    await deviceRef.set(state);
//
//    // 🔹 Respond immediately (non-blocking UX)
//    res.json({
//      message: "Command sent, verifying response",
//      deviceName,
//      requested_state: state,
//    });
//
//    // 🔹 3. Wait 5 seconds
//    setTimeout(async () => {
//      try {
//        const resSnap = await deviceResRef.once("value");
//        const currentRes = resSnap.val();
//
//        // 🔹 4. If response NOT changed → rollback
//        if (currentRes !== state) {
//          console.warn(
//            `Rollback: ${deviceName} response not updated. Reverting to ${oldState}`
//          );
//
//          await deviceRef.set(oldState);
//        }
//      } catch (err) {
//        console.error("Rollback check failed:", err);
//      }
//    }, 5000);
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: err.message });
//  }
//};
//
//module.exports = {
//  createRoom,
//  getRooms,
//  getRoomById,
//  updateRoom,
//  deleteRoom,
//  updateDeviceStates,
//};
//







/* ================================
   CREATE ROOM
================================ */
const { db } = require("../services/firebaseAdmin");

// const createRoom = async (req, res) => {
//   const userId = req.user?.uid;
//   const { room_name, board_id, devices } = req.body;

//   // 🔹 Basic validation
//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized: userId missing" });
//   }

//   if (!room_name || !board_id || !Array.isArray(devices) || devices.length === 0) {
//     return res.status(400).json({
//       error: "room_name, board_id and devices array are required",
//     });
//   }

//   try {
//     // 🔹 Check if user exists
//     const userRef = db.ref(`users/${userId}`);
//     const userSnap = await userRef.once("value");

//     if (!userSnap.exists()) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // 🔹 Check if board exists
//     const boardRef = db.ref(`users/${userId}/${board_id}`);
//     const boardSnap = await boardRef.once("value");

//     if (!boardSnap.exists()) {
//       return res.status(404).json({ error: "Board not found" });
//     }

//     // 🔹 Validate selected devices exist in board
//     const boardData = boardSnap.val();
//     const validDevices = devices.filter(
//       (d) => boardData.hasOwnProperty(d)
//     );

//     if (validDevices.length !== devices.length) {
//       return res.status(400).json({
//         error: "One or more selected devices do not exist on this board",
//       });
//     }

//     // 🔹 Create room (MAPPING ONLY)
//     const roomRef = db.ref(`users/${userId}/rooms`).push();
//     const roomData = {
//       room_name,
//       board_id,
//       devices: validDevices,
//       created_at: new Date().toISOString(),
//     };

//     await roomRef.set(roomData);

//     return res.status(201).json({
//       message: "Room created successfully",
//       roomId: roomRef.key,
//       room: roomData,
//     });

//   } catch (error) {
//     console.error("🔥 Error creating room:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


const createRoom = async (req, res) => {
  const userId = req.user?.uid;
  const { room_name, boards } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!room_name || !Array.isArray(boards) || !boards.length) {
    return res.status(400).json({ error: "room_name and boards required" });
  }

  try {
    for (const b of boards) {
      const boardSnap = await db.ref(`users/${userId}/${b.board_id}`).once("value");
      if (!boardSnap.exists()) {
        return res.status(404).json({ error: `Board not found: ${b.board_id}` });
      }

      const boardData = boardSnap.val();
      const validDevices = b.devices.filter(d => boardData.hasOwnProperty(d));

      if (validDevices.length !== b.devices.length) {
        return res.status(400).json({ error: `Invalid device in board ${b.board_id}` });
      }
    }

    const roomRef = db.ref(`users/${userId}/rooms`).push();
    const roomData = {
      room_name,
      boards,
      created_at: new Date().toISOString()
    };

    await roomRef.set(roomData);

    res.status(201).json({
      message: "Room created",
      roomId: roomRef.key,
      room: roomData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// const createRoom = async (req, res) => {
//   const userId = req.user?.uid;
//   const { room_name, board_id, devices } = req.body;

//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   if (!room_name || !board_id || !Array.isArray(devices) || !devices.length) {
//     return res.status(400).json({ error: "room_name, board_id, devices required" });
//   }

//   try {
//     const boardRef = db.ref(`users/${userId}/${board_id}`);
//     const boardSnap = await boardRef.once("value");

//     if (!boardSnap.exists()) {
//       return res.status(404).json({ error: "Board not found" });
//     }

//     const boardData = boardSnap.val();

//     const validDevices = devices.filter(d => boardData.hasOwnProperty(d));

//     if (validDevices.length !== devices.length) {
//       return res.status(400).json({ error: "Invalid device in list" });
//     }

//     const roomRef = db.ref(`users/${userId}/rooms`).push();

//     const roomData = {
//       room_name,
//       board_id,
//       devices: validDevices,
//       created_at: new Date().toISOString(),
//     };

//     await roomRef.set(roomData);

//     res.status(201).json({ message: "Room created", roomId: roomRef.key, room: roomData });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


/* ================================
   GET ALL ROOMS
================================ */
// const getRooms = async (req, res) => {
//   const userId = req.user?.uid;

//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized: userId missing" });
//   }

//   try {
//     const roomsRef = db.ref(`users/${userId}/rooms`);
//     const snapshot = await roomsRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(200).json({ total_rooms: 0, rooms: [] });
//     }

//     const rooms = snapshot.val();

//     const roomList = Object.entries(rooms).map(([roomId, room]) => {
//       const selectedDevices = room.selected_devices || {};

//       const baseDevices = new Set();
//       Object.keys(selectedDevices).forEach((key) => {
//         if (key.endsWith("_Res")) {
//           baseDevices.add(key.replace("_Res", ""));
//         } else {
//           baseDevices.add(key);
//         }
//       });

//       let activeDevices = 0;
//       baseDevices.forEach((device) => {
//         if (
//           selectedDevices[`${device}_Res`] === 1 ||
//           selectedDevices[device] === 1
//         ) {
//           activeDevices++;
//         }
//       });

//       return {
//         roomId,
//         room_name: room.room_name,
//         board_id: room.board_id,
//         total_devices: baseDevices.size,
//         active_devices: activeDevices,
//         created_at: room.created_at || null,
//       };
//     });

//     res.status(200).json({
//       total_rooms: roomList.length,
//       rooms: roomList,
//     });

//   } catch (error) {
//     console.error("🔥 Error fetching rooms:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


const getRooms = async (req, res) => {
  const userId = req.user?.uid;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const roomsSnap = await db.ref(`users/${userId}/rooms`).once("value");
    if (!roomsSnap.exists()) {
      return res.json({ total_rooms: 0, rooms: [] });
    }

    const rooms = roomsSnap.val();
    const result = [];

    for (const [roomId, room] of Object.entries(rooms)) {
      let totalDevices = 0;
      let activeDevices = 0;

      for (const b of room.boards) {
        const boardSnap = await db.ref(`users/${userId}/${b.board_id}`).once("value");
        const board = boardSnap.val() || {};

        totalDevices += b.devices.length;
        b.devices.forEach(d => {
          if (board[`${d}_Res`] === 1) activeDevices++;
        });
      }

      result.push({
        roomId,
        room_name: room.room_name,
        total_devices: totalDevices,
        active_devices: activeDevices,
        created_at: room.created_at || null
      });
    }

    res.json({ total_rooms: result.length, rooms: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// const getRooms = async (req, res) => {
//   const userId = req.user?.uid;
//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const roomsSnap = await db.ref(`users/${userId}/rooms`).once("value");

//     if (!roomsSnap.exists()) {
//       return res.json({ total_rooms: 0, rooms: [] });
//     }

//     const rooms = roomsSnap.val();
//     const result = [];

//     for (const [roomId, room] of Object.entries(rooms)) {

//       const boardSnap = await db.ref(`users/${userId}/${room.board_id}`).once("value");
//       const board = boardSnap.val() || {};

//       let active = 0;

//       room.devices.forEach(d => {
//         if (board[`${d}_Res`] === 1) active++;
//       });

//       result.push({
//         roomId,
//         room_name: room.room_name,
//         board_id: room.board_id,
//         total_devices: room.devices.length,
//         active_devices: active,
//         created_at: room.created_at || null
//       });
//     }

//     res.json({ total_rooms: result.length, rooms: result });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


/* ================================
   GET SINGLE ROOM
================================ */
// const getRoom = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;

//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
//     const snapshot = await roomRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ error: "Room not found" });
//     }

//     const room = snapshot.val();
//     const selectedDevices = room.selected_devices || {};

//     const baseDevices = new Set();
//     Object.keys(selectedDevices).forEach((key) => {
//       if (key.endsWith("_Res")) {
//         baseDevices.add(key.replace("_Res", ""));
//       } else {
//         baseDevices.add(key);
//       }
//     });

//     let activeDevices = 0;
//     baseDevices.forEach((device) => {
//       if (
//         selectedDevices[`${device}_Res`] === 1 ||
//         selectedDevices[device] === 1
//       ) {
//         activeDevices++;
//       }
//     });

//     res.status(200).json({
//       roomId,
//       room_name: room.room_name,
//       board_id: room.board_id,
//       selected_devices: selectedDevices,
//       total_devices: baseDevices.size,
//       active_devices: activeDevices,
//       created_at: room.created_at || null,
//     });

//   } catch (error) {
//     console.error("🔥 Error fetching room:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



const getRoomById = async (req, res) => {
  const userId = req.user?.uid;
  const { roomId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
    if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

    const room = roomSnap.val();
    const boardsData = [];

    for (const b of room.boards) {
      const boardSnap = await db.ref(`users/${userId}/${b.board_id}`).once("value");
      const board = boardSnap.val() || {};

      const devices = {};
      b.devices.forEach(d => {
        devices[d] = {
          command: board[d],
          status: board[`${d}_Res`]
        };
      });

      boardsData.push({
        board_id: b.board_id,
        devices
      });
    }

    res.json({
      roomId,
      room_name: room.room_name,
      boards: boardsData,
      created_at: room.created_at || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// const getRoomById = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;

//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");

//     if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

//     const room = roomSnap.val();

//     const boardSnap = await db.ref(`users/${userId}/${room.board_id}`).once("value");
//     if (!boardSnap.exists()) return res.status(404).json({ error: "Board not found" });

//     const board = boardSnap.val();

//     const devices = {};

//     room.devices.forEach(d => {
//       devices[d] = {
//         command: board[d],
//         status: board[`${d}_Res`]
//       };
//     });

//     res.json({
//       roomId,
//       room_name: room.room_name,
//       board_id: room.board_id,
//       devices,
//       total_devices: room.devices.length,
//       created_at: room.created_at || null
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

/* ================================
   UPDATE ROOM
================================ */
// const updateRoom = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;
//   const { room_name, board_id, selected_devices } = req.body;

//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
//     const roomSnap = await roomRef.once("value");

//     if (!roomSnap.exists()) {
//       return res.status(404).json({ error: "Room not found" });
//     }

//     // Validate board
//     const boardRef = db.ref(`users/${userId}/${board_id}`);
//     const boardSnap = await boardRef.once("value");

//     if (!boardSnap.exists()) {
//       return res.status(404).json({ error: "Board not found" });
//     }

//     const formattedDevices = {};

//     if (selected_devices?.fans) {
//       selected_devices.fans.forEach((fan) => {
//         formattedDevices[fan] = 0;
//         formattedDevices[`${fan}_Res`] = 0;
//       });
//     }

//     if (selected_devices?.switches) {
//       selected_devices.switches.forEach((sw) => {
//         formattedDevices[sw] = 0;
//         formattedDevices[`${sw}_Res`] = 0;
//       });
//     }

//     const updatedRoom = {
//       ...roomSnap.val(),
//       room_name,
//       board_id,
//       selected_devices: formattedDevices,
//       updated_at: new Date().toISOString(),
//     };

//     await roomRef.set(updatedRoom);

//     res.status(200).json({
//       message: "Room updated successfully",
//       roomId,
//       room: updatedRoom,
//     });

//   } catch (error) {
//     console.error("Error updating room:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


const updateRoom = async (req, res) => {
  const userId = req.user?.uid;
  const { roomId } = req.params;
  const { room_name, boards } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
    const roomSnap = await roomRef.once("value");
    if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

    for (const b of boards) {
      const boardSnap = await db.ref(`users/${userId}/${b.board_id}`).once("value");
      if (!boardSnap.exists()) {
        return res.status(404).json({ error: `Board not found: ${b.board_id}` });
      }
    }

    const updated = {
      ...roomSnap.val(),
      room_name,
      boards,
      updated_at: new Date().toISOString()
    };

    await roomRef.set(updated);
    res.json({ message: "Room updated", roomId, room: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// const updateRoom = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;
//   const { room_name, board_id, devices } = req.body;

//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
//     const roomSnap = await roomRef.once("value");

//     if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

//     const boardSnap = await db.ref(`users/${userId}/${board_id}`).once("value");
//     if (!boardSnap.exists()) return res.status(404).json({ error: "Board not found" });

//     const board = boardSnap.val();
//     const validDevices = devices.filter(d => board.hasOwnProperty(d));

//     if (validDevices.length !== devices.length) {
//       return res.status(400).json({ error: "Invalid device in list" });
//     }

//     const updated = {
//       ...roomSnap.val(),
//       room_name,
//       board_id,
//       devices: validDevices,
//       updated_at: new Date().toISOString()
//     };

//     await roomRef.set(updated);

//     res.json({ message: "Room updated", roomId, room: updated });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


/* ================================
   DELETE ROOM
================================ */
// const deleteRoom = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;

//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
//     const snapshot = await roomRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ error: "Room not found" });
//     }

//     await roomRef.remove();

//     res.status(200).json({
//       message: "Room deleted successfully",
//       roomId,
//     });

//   } catch (error) {
//     console.error("Error deleting room:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

const deleteRoom = async (req, res) => {
  const userId = req.user?.uid;
  const { roomId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const roomRef = db.ref(`users/${userId}/rooms/${roomId}`);
    const snap = await roomRef.once("value");

    if (!snap.exists()) return res.status(404).json({ error: "Room not found" });

    await roomRef.remove();

    res.json({ message: "Room deleted", roomId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ================================
   UPDATE DEVICE STATE
================================ */


// const updateDeviceStates = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;
//   const { deviceName, state } = req.body;

//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
//     if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

//     const room = roomSnap.val();

//     if (!room.devices.includes(deviceName)) {
//       return res.status(404).json({ error: "Device not in room" });
//     }

//     const deviceRef = db.ref(`users/${userId}/${room.board_id}/${deviceName}`);
//     const deviceResRef = db.ref(`users/${userId}/${room.board_id}/${deviceName}_Res`);

//     // 🔹 1. Read old state
//     const oldStateSnap = await deviceRef.once("value");
//     const oldState = oldStateSnap.val();

//     // 🔹 2. Send new command
//     await deviceRef.set(state);

//     // 🔹 Respond immediately (non-blocking UX)
//     res.json({
//       message: "Command sent, verifying response",
//       deviceName,
//       requested_state: state,
//     });

//     // 🔹 3. Wait 5 seconds
//     setTimeout(async () => {
//       try {
//         const resSnap = await deviceResRef.once("value");
//         const currentRes = resSnap.val();

//         // 🔹 4. If response NOT changed → rollback
//         if (currentRes !== state) {
//           console.warn(
//             `Rollback: ${deviceName} response not updated. Reverting to ${oldState}`
//           );

//           await deviceRef.set(oldState);
//         }
//       } catch (err) {
//         console.error("Rollback check failed:", err);
//       }
//     }, 5000);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// const updateDeviceStates = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;
//   const { board_id, deviceName, state } = req.body;

//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
//     if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

//     const room = roomSnap.val();
//     const board = room.boards.find(b => b.board_id === board_id);
//     if (!board || !board.devices.includes(deviceName)) {
//       return res.status(404).json({ error: "Device not found in room" });
//     }

//     const cmdRef = db.ref(`users/${userId}/${board_id}/${deviceName}`);
//     const resRef = db.ref(`users/${userId}/${board_id}/${deviceName}_Res`);

//     const oldState = (await cmdRef.once("value")).val();
//     await cmdRef.set(state);

//     res.json({ message: "Command sent", deviceName, state });

//     setTimeout(async () => {
//       const currentRes = (await resRef.once("value")).val();
//       if (currentRes !== state) {
//         await cmdRef.set(oldState);
//       }
//     }, 10000);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };
const updateDeviceStates = async (req, res) => {
  const userId = req.user?.uid;
  const { roomId } = req.params;
  const { board_id, deviceName, state } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
    if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

    const room = roomSnap.val();
    const board = room.boards.find(b => b.board_id === board_id);
    if (!board || !board.devices.includes(deviceName)) {
      return res.status(404).json({ error: "Device not found in room" });
    }

    const cmdRef = db.ref(`users/${userId}/${board_id}/${deviceName}`);

    // Command update karein
    await cmdRef.set(state);

    // Immediate response bhejein
    return res.json({ message: "Command sent", deviceName, state });
  } catch (err) {
    console.error("Device update error:", err);
    return res.status(500).json({ error: err.message });
  }
};


// const updateDeviceStates = async (req, res) => {
//   const userId = req.user?.uid;
//   const { roomId } = req.params;
//   const { deviceName, state } = req.body;

//   console.log("Update Device State Request:", { userId, roomId, deviceName, state });

//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const roomSnap = await db.ref(`users/${userId}/rooms/${roomId}`).once("value");
//     if (!roomSnap.exists()) return res.status(404).json({ error: "Room not found" });

//     const room = roomSnap.val();
//     console.log("Room Data:", room);
//     if (!room.devices.includes(deviceName)) {
//       return res.status(404).json({ error: "Device not in room" });
//     }

//     await db.ref(`users/${userId}/${room.board_id}/${deviceName}`).set(state);

//     res.json({ message: "Command sent to board", deviceName, state });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateDeviceStates,
};



