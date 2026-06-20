const express = require("express");
const controller = require("../controllers/event.controller");

const router = express.Router();

// router.post("/", controller.createOrUpdateEvent);
// router.post("/cancel/:uid", controller.cancelEvent);
// router.get("/ics/:uid", controller.downloadICS);
router.post("/create", controller.createEvent);
router.put("/update/:id", controller.updateEvent);
router.delete("/cancel/:id", controller.cancelEvent);
router.get("/realtime-visitors", controller.getRealTimeVisitors);

module.exports = router;
