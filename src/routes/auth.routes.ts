const express = require("express");
const controller = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authenticate, controller.me);
router.post("/logout", authenticate, controller.logout);

export = router;
