const express = require("express");
const router = express.Router();
const foodController = require("../controllers/food.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/food  (partner-protected)
router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  upload.single("video"),
  foodController.createFood
);

// GET /api/food  (user-protected; change to public if you want)
router.get("/", authMiddleware.authUserMiddleware, foodController.getFoodItems);

// LIKE toggle (user-protected)
router.post(
  "/like",
  authMiddleware.authUserMiddleware,
  foodController.likeFood
);

// SAVE toggle (user-protected)  ✅ FIXED: call saveFood (not getSavedFoods)
router.post(
  "/save",
  authMiddleware.authUserMiddleware,
  foodController.saveFood
);

// GET saved list (user-protected)
router.get(
  "/saved",
  authMiddleware.authUserMiddleware,
  foodController.getSavedFoods
);

module.exports = router;
