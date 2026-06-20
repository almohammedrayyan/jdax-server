const express = require("express");
const controller = require("../controllers/contact.controller");

const router = express.Router();

// router.post("/", controller.createOrUpdateEvent);
// router.post("/cancel/:uid", controller.cancelEvent);
// router.get("/ics/:uid", controller.downloadICS);

router.post("/form", controller.submitContactForm);

module.exports = router;
