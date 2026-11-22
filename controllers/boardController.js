const { db } = require("../services/firebaseAdmin");


// CREATE Board (auto-generate boardId, store under users/<uid>/boards/<boardId>)
// const createBoard = async (req, res) => {
//     const userId = req.user?.uid;
//     const { board_name, num_switches, num_fans } = req.body;

//     console.log("UID from token:", userId);

//     // Validation
//     if (!userId) {
//         return res.status(401).json({ error: "Unauthorized: userId missing" });
//     }
//     if (!board_name) {
//         return res.status(400).json({ error: "Board name is required" });
//     }
//     if (num_switches === undefined || num_fans === undefined) {
//         return res.status(400).json({
//             error: "Number of switches and fans are required",
//         });
//     }
//     if (num_switches < 0 || num_switches > 10) {
//         return res.status(400).json({
//             error: "Number of switches must be between 0 and 10",
//         });
//     }
//     if (num_fans < 0 || num_fans > 10) {
//         return res.status(400).json({
//             error: "Number of fans must be between 0 and 10",
//         });
//     }

//     try {
//         // Ensure user exists (create minimal user if missing)
//         const userRef = db.ref(`users/${userId}`);
//         const userSnapshot = await userRef.once("value");
//         let userData = userSnapshot.val();

//         if (!userSnapshot.exists()) {
//             console.log("User not found, creating new user record...");
//             userData = {
//                 uid: userId,
//                 name: req.user.name || "Unknown User",
//                 email: req.user.email || "unknown@example.com",
//                 created_at: new Date().toISOString(),
//             };
//             await userRef.set(userData);
//         }

//         // Use a dedicated boards node under the user
//         const boardsRef = db.ref(`users/${userId}/boards`);
//         const boardsSnapshot = await boardsRef.once("value");
//         const boards = boardsSnapshot.val() || {};

//         // Prevent duplicate board_name under same user
//         const duplicate = Object.values(boards).some(
//             (b) => b && b.board_name && b.board_name.toLowerCase() === board_name.toLowerCase()
//         );
//         if (duplicate) {
//             return res.status(400).json({ error: "Board name already exists" });
//         }

//         // Build board data (board_name is stored as a field)
//         const boardData = {
//             board_name,
//             num_switches,
//             num_fans,
//             created_by: userData.name || "Unknown",
//             created_by_email: userData.email || "",
//             created_at: new Date().toISOString(),
//         };

//         // Add switches and their _Res pairs
//         for (let i = 1; i <= num_switches; i++) {
//             boardData[`Switch_${i}`] = 0;
//             boardData[`Switch_${i}_Res`] = 0;
//         }

//         // Add fans and their _Res pairs
//         for (let i = 1; i <= num_fans; i++) {
//             boardData[`Fan_${i}`] = 0;
//             boardData[`Fan_${i}_Res`] = 0;
//         }

//         // Create new board under users/<userId>/boards with generated key
//         const newBoardRef = boardsRef.push();
//         await newBoardRef.set(boardData);

//         // Return generated boardId (key) and board object
//         res.status(201).json({
//             message: "Board created successfully",
//             boardId: newBoardRef.key,
//             board: boardData,
//         });
//     } catch (error) {
//         console.error("Error creating board:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

const createBoard = async (req, res) => {
    const userId = req.user?.uid;
    const { board_name, num_switches, num_fans } = req.body;

    // ================= VALIDATIONS =================
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: userId missing" });
    }

    if (!board_name) {
        return res.status(400).json({ error: "Board name is required" });
    }

    if (
        num_switches === undefined ||
        num_fans === undefined ||
        num_switches < 0 ||
        num_switches > 10 ||
        num_fans < 0 ||
        num_fans > 10
    ) {
        return res.status(400).json({
            error: "Switches and fans must be between 0 and 10",
        });
    }

    try {
        const userRef = db.ref(`users/${userId}`);
        const userSnapshot = await userRef.once("value");

        // ================= CREATE USER IF NOT EXISTS =================
        if (!userSnapshot.exists()) {
            await userRef.set({
                uid: userId,
                created_at: new Date().toISOString(),
            });
        }

        // ================= GET EXISTING BOARDS =================
        const userData = (await userRef.once("value")).val() || {};

        const existingBoards = Object.keys(userData).filter((key) =>
            key.startsWith("BOARD_")
        );

        // ================= CHECK DUPLICATE BOARD NAME =================
        for (const key of existingBoards) {
            if (
                userData[key]?.board_name &&
                userData[key].board_name.toLowerCase() === board_name.toLowerCase()
            ) {
                return res.status(400).json({
                    error: "Board name already exists",
                });
            }
        }

        // ================= GENERATE BOARD KEY =================
        const boardNumber = existingBoards.length + 1;
        const boardKey = `BOARD_${boardNumber}`;

        // ================= CREATE BOARD OBJECT =================
        const boardData = {
            board_name,
            Load: "@",
        };

        // Add switches
        for (let i = 1; i <= num_switches; i++) {
            boardData[`Switch_${i}`] = 0;
            boardData[`Switch_${i}_Res`] = 0;
        }

        // Add fans
        for (let i = 1; i <= num_fans; i++) {
            boardData[`Fan_${i}`] = 0;
            boardData[`Fan_${i}_Res`] = 0;
        }

        // ================= SAVE BOARD =================
        await db.ref(`users/${userId}/${boardKey}`).set(boardData);

        // ================= RESPONSE =================
        return res.status(201).json({
            message: "Board created successfully",
            boardKey,
            board: boardData,
        });

    } catch (error) {
        console.error("Error creating board:", error);
        return res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
};

const getBoards = async (req, res) => {
    const userId = req.user?.uid;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const userRef = db.ref(`users/${userId}`);
        const snap = await userRef.once("value");

        if (!snap.exists()) {
            return res.status(200).json({ boards: [] });
        }

        const data = snap.val();

        const boards = Object.entries(data)
            .filter(([key]) => key.startsWith("BOARD_"))
            .map(([boardId, board]) => ({ boardId, ...board }));

        res.json({ total: boards.length, boards });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// // ✅ GET All Boards for a User
// const getBoards = async (req, res) => {
//     const userId = req.user?.uid;

//     if (!userId) {
//         return res.status(401).json({ error: "Unauthorized: userId missing" });
//     }

//     try {
//         const userRef = db.ref(`users/${userId}`);
//         const userSnapshot = await userRef.once("value");
//         let userData = userSnapshot.val();

//         // 🟡 If user does not exist → create a default user
//         if (!userSnapshot.exists()) {
//             console.log("User not found, creating new user record...");

//             userData = {
//                 uid: userId,
//                 name: req.user.name || "Unknown User",
//                 email: req.user.email || "unknown@example.com",
//                 created_at: new Date().toISOString(),
//             };

//             await userRef.set(userData);

//             return res.status(200).json({
//                 message: "User not found. New user created. No boards yet.",
//                 boards: [],
//             });
//         }

//         // 🟢 Get boards node
//         const boardsRef = db.ref(`users/${userId}/boards`);
//         const boardsSnapshot = await boardsRef.once("value");
//         const boardsData = boardsSnapshot.val();

//         if (!boardsData) {
//             return res.status(200).json({ message: "No boards found", boards: [] });
//         }

//         // Convert to array with boardId
//         const boards = Object.entries(boardsData).map(([boardId, board]) => ({
//             boardId,
//             ...board,
//         }));

//         res.status(200).json({ total: boards.length, boards });
//     } catch (error) {
//         console.error("Error fetching boards:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ✅ GET Single Board by boardId
// const getBoard = async (req, res) => {
//     const userId = req.user?.uid;
//     const { boardId } = req.params;

//     if (!userId) {
//         return res.status(401).json({ error: "Unauthorized: userId missing" });
//     }

//     try {
//         // 🟢 Check if user exists
//         const userRef = db.ref(`users/${userId}`);
//         const userSnapshot = await userRef.once("value");

//         if (!userSnapshot.exists()) {
//             console.log("User not found, creating new user record...");

//             await userRef.set({
//                 uid: userId,
//                 name: req.user.name || "Unknown User",
//                 email: req.user.email || "unknown@example.com",
//                 created_at: new Date().toISOString(),
//             });

//             return res.status(404).json({
//                 error: "User did not exist. User created. No boards found.",
//             });
//         }

//         // 🟢 Fetch specific board from /boards/<boardId>
//         const boardSnapshot = await db.ref(`users/${userId}/boards/${boardId}`).once("value");
//         const board = boardSnapshot.val();

//         if (!board) {
//             return res.status(404).json({ error: "Board not found" });
//         }

//         res.status(200).json({ boardId, ...board });
//     } catch (error) {
//         console.error("Error fetching single board:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

const getBoardById = async (req, res) => {
    const userId = req.user?.uid;
    const { boardId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const boardRef = db.ref(`users/${userId}/${boardId}`);
        const snap = await boardRef.once("value");

        if (!snap.exists()) {
            return res.status(404).json({ error: "Board not found" });
        }

        res.json({ boardId, ...snap.val() });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};



// ✅ UPDATE Board

// const updateBoard = async (req, res) => {
//     const userId = req.user?.uid;
//     const { boardId } = req.params;
//     const { board_name, num_switches, num_fans } = req.body;

//     // ================= Validation =================
//     if (!userId) {
//         return res.status(401).json({ error: "Unauthorized: userId missing" });
//     }

//     if (!boardId) {
//         return res.status(400).json({ error: "boardId is required" });
//     }

//     if (!board_name) {
//         return res.status(400).json({ error: "Board name is required" });
//     }

//     if (num_switches === undefined || num_fans === undefined) {
//         return res.status(400).json({
//             error: "Number of switches and fans are required"
//         });
//     }

//     if (num_switches < 0 || num_switches > 10) {
//         return res.status(400).json({
//             error: "Number of switches must be between 0 and 10"
//         });
//     }

//     if (num_fans < 0 || num_fans > 10) {
//         return res.status(400).json({
//             error: "Number of fans must be between 0 and 10"
//         });
//     }

//     try {
//         const boardsRef = db.ref(`users/${userId}/boards`);
//         const boardRef = db.ref(`users/${userId}/boards/${boardId}`);

//         // ================= Check board exist =================
//         const boardSnapshot = await boardRef.once("value");

//         if (!boardSnapshot.exists()) {
//             return res.status(404).json({ error: "Board not found" });
//         }

//         // ================= Duplicate board name check =================
//         const allBoardsSnapshot = await boardsRef.once("value");
//         const allBoards = allBoardsSnapshot.val() || {};

//         const duplicate = Object.entries(allBoards).some(([key, b]) => {
//             return (
//                 key !== boardId &&
//                 b?.board_name?.toLowerCase() === board_name.toLowerCase()
//             );
//         });

//         if (duplicate) {
//             return res.status(400).json({ error: "Board name already exists" });
//         }

//         // ================= Get existing board =================
//         const existingBoard = boardSnapshot.val();

//         // ================= Rebuild updated data =================
//         const updatedBoard = {
//             ...existingBoard,
//             board_name,
//             num_switches,
//             num_fans,
//             updated_at: new Date().toISOString()
//         };

//         // --- Remove old switch/fan keys ---
//         Object.keys(updatedBoard).forEach((key) => {
//             if (
//                 key.startsWith("Switch_") ||
//                 key.startsWith("Fan_")
//             ) {
//                 delete updatedBoard[key];
//             }
//         });

//         // --- Add new switches ---
//         for (let i = 1; i <= num_switches; i++) {
//             updatedBoard[`Switch_${i}`] = 0;
//             updatedBoard[`Switch_${i}_Res`] = 0;
//         }

//         // --- Add new fans ---
//         for (let i = 1; i <= num_fans; i++) {
//             updatedBoard[`Fan_${i}`] = 0;
//             updatedBoard[`Fan_${i}_Res`] = 0;
//         }

//         // ================= Update in DB =================
//         await boardRef.set(updatedBoard);

//         res.status(200).json({
//             message: "Board updated successfully",
//             boardId,
//             board: updatedBoard
//         });

//     } catch (error) {
//         console.error("Error updating board:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

const updateBoard = async (req, res) => {
    const userId = req.user?.uid;
    const { boardId } = req.params;
    const { board_name, num_switches, num_fans } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const boardRef = db.ref(`users/${userId}/${boardId}`);
        const snap = await boardRef.once("value");

        if (!snap.exists()) return res.status(404).json({ error: "Board not found" });

        const existing = snap.val();

        const updated = {
            board_name,
            Load: existing.Load || "@",
        };

        // rebuild switches
        for (let i = 1; i <= num_switches; i++) {
            updated[`Switch_${i}`] = existing[`Switch_${i}`] ?? 0;
            updated[`Switch_${i}_Res`] = existing[`Switch_${i}_Res`] ?? 0;
        }

        // rebuild fans
        for (let i = 1; i <= num_fans; i++) {
            updated[`Fan_${i}`] = existing[`Fan_${i}`] ?? 0;
            updated[`Fan_${i}_Res`] = existing[`Fan_${i}_Res`] ?? 0;
        }

        await boardRef.set(updated);

        res.json({ message: "Board updated", boardId, board: updated });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// ✅ DELETE Board
// const deleteBoard = async (req, res) => {
//     try {
//         const userId = req.user?.uid;
//         const { boardId } = req.params;

//         console.log("UID from token:", userId);
//         console.log("Board ID:", boardId);

//         // Validation
//         if (!userId) {
//             return res.status(401).json({ error: "Unauthorized: userId missing" });
//         }

//         if (!boardId) {
//             return res.status(400).json({ error: "Board ID is required" });
//         }

//         const boardRef = db
//             .ref(`users/${userId}/boards/${boardId}`);

//         // Check if board exists
//         const snapshot = await boardRef.once("value");

//         if (!snapshot.exists()) {
//             return res.status(404).json({ error: "Board not found" });
//         }

//         // Delete board
//         await boardRef.remove();

//         return res.status(200).json({
//             message: "Board deleted successfully",
//             boardId
//         });

//     } catch (error) {
//         console.error("Delete Board Error:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };

const deleteBoard = async (req, res) => {
  const userId = req.user?.uid;
  const { boardId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const boardRef = db.ref(`users/${userId}/${boardId}`);
    const snap = await boardRef.once("value");

    if (!snap.exists()) return res.status(404).json({ error: "Board not found" });

    await boardRef.remove();

    // remove rooms linked to this board
    const roomsRef = db.ref(`users/${userId}/rooms`);
    const roomsSnap = await roomsRef.once("value");

    if (roomsSnap.exists()) {
      const updates = {};
      const rooms = roomsSnap.val();

      Object.entries(rooms).forEach(([rid, room]) => {
        if (room.board_id === boardId) {
          updates[rid] = null;
        }
      });

      if (Object.keys(updates).length) {
        await roomsRef.update(updates);
      }
    }

    res.json({ message: "Board deleted", boardId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// UPDATE Switch/Fan State
const updateDeviceState = async (req, res) => {
    const userId = req.user.uid;
    const { boardId } = req.params;
    const { device_type, device_number, state } = req.body;

    // Validation
    if (!device_type || !device_number || state === undefined) {
        return res.status(400).json({
            error: "device_type, device_number, and state are required"
        });
    }

    if (!['Switch', 'Fan'].includes(device_type)) {
        return res.status(400).json({
            error: "device_type must be 'Switch' or 'Fan'"
        });
    }

    if (![0, 1].includes(state)) {
        return res.status(400).json({
            error: "state must be 0 or 1"
        });
    }

    try {
        const deviceKey = `${device_type}_${device_number}`;
        const updates = {
            [deviceKey]: state,
            [`${deviceKey}_Res`]: state
        };

        await db.ref(`users/${userId}/${boardId}`).update(updates);

        res.status(200).json({
            message: `${device_type} ${device_number} updated successfully`,
            state
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const toggleDeviceState = async (req, res) => {
    const userId = req.user.uid;
    const { boardId } = req.params;
    const { device_type, device_number } = req.body;

    // Validation
    if (!device_type || !device_number) {
        return res.status(400).json({
            error: "device_type and device_number are required"
        });
    }

    if (!['Switch', 'Fan'].includes(device_type)) {
        return res.status(400).json({
            error: "device_type must be 'Switch' or 'Fan'"
        });
    }

    try {
        const deviceKey = `${device_type}_${device_number}`;
        const deviceRef = db.ref(`users/${userId}/${boardId}/${deviceKey}`);

        // Get current state
        const snapshot = await deviceRef.once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({
                error: `${device_type} ${device_number} does not exist on this board`
            });
        }

        const currentState = snapshot.val();
        const newState = currentState === 1 ? 0 : 1;

        // Update with toggled state
        const updates = {
            [deviceKey]: newState,
            [`${deviceKey}_Res`]: newState,
            last_updated: new Date().toISOString()
        };

        await db.ref(`users/${userId}/${boardId}`).update(updates);

        res.status(200).json({
            message: `${device_type} ${device_number} toggled successfully`,
            boardId,
            device: deviceKey,
            previous_state: currentState,
            new_state: newState,
            timestamp: updates.last_updated
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET Device State
const getDeviceState = async (req, res) => {
    const userId = req.user.uid;
    const { boardId } = req.params;
    const { device_type, device_number } = req.query;

    // Validation
    if (!device_type || !device_number) {
        return res.status(400).json({
            error: "device_type and device_number are required as query parameters"
        });
    }

    try {
        const deviceKey = `${device_type}_${device_number}`;
        const deviceRef = db.ref(`users/${userId}/${boardId}/${deviceKey}`);

        const snapshot = await deviceRef.once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({
                error: `${device_type} ${device_number} does not exist on this board`
            });
        }

        const state = snapshot.val();
        const resSnapshot = await db.ref(`users/${userId}/${boardId}/${deviceKey}_Res`).once("value");

        res.status(200).json({
            boardId,
            device: deviceKey,
            state,
            response_state: resSnapshot.val(),
            synced: state === resSnapshot.val()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    createBoard,
    getBoards,
    getBoardById,
    updateBoard,
    updateDeviceState,
    deleteBoard,
    getDeviceState,
    toggleDeviceState
};
