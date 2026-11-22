const express = require("express");
const router = express.Router();
const { toggleDevice } = require("../controllers/deviceController");
const { createRoom, getRooms, updateRoom, deleteRoom, getRoom, updateDeviceStates, getRoomById } = require("../controllers/roomController");
const { loginUser, registerUser, logoutUser } = require("../controllers/authController");
const verifyToken = require("../middlewares/auth");
const { addSwitch, updateSwitch, deleteSwitch, updateSwitchName, getSwitches, updateSwitchState } = require("../controllers/switchController");
const {deleteBoard, createBoard, updateBoard, updateDeviceState, getBoards, getBoard, getBoardById } = require("../controllers/boardController");

router.post("/toggle", toggleDevice);
// router.post("/create",verifyToken, createRoom);

// Authentication Routes
router.post("/register", registerUser);
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.post("/create-room", verifyToken, createRoom);
router.get("/get-rooms", verifyToken, getRooms);
router.put("/update-room/:roomId", verifyToken, updateRoom);
router.delete("/delete-room/:roomId", verifyToken, deleteRoom);
router.get("/get-room-by-id/:roomId", verifyToken, getRoomById);
router.post("/update-device-state/:roomId", verifyToken, updateDeviceStates);


router.post("/add-switches/:roomId", verifyToken, addSwitch);
router.get("/get-switch/:roomId",verifyToken, getSwitches);
router.put("/update-switch-name/:roomId/:switchId", verifyToken, updateSwitchName);
router.put("/update-switch-state/:roomId/:switchId", verifyToken, updateSwitchState);
router.delete("/delete-switch/:roomId/:switchId", verifyToken, deleteSwitch);


router.post("/add-board", verifyToken, createBoard);
router.put("/update-board/:boardId", verifyToken, updateBoard);
router.get("/get-board", verifyToken, getBoards);
router.get("/get-board-by-id/:boardId", verifyToken, getBoardById);
router.delete("/delete-board/:boardId", verifyToken, deleteBoard);
// router.put("/update-device-state/:boardId/:deviceId", verifyToken, updateDeviceState);

module.exports = router;
