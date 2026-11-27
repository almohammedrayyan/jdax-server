const express = require("express");
const controller = require("../controllers/content-schedule.controller");

const router = express.Router();

router.post("/", controller.createContentSchedule);
router.post("/bulk", controller.createBulkContentSchedules);
router.get("/get-all", controller.getContentSchedules);
router.get("/:id", controller.getContentScheduleById);
router.put("/:id", controller.updateContentSchedule);
router.delete("/:id", controller.deleteContentSchedule);

module.exports = router;
