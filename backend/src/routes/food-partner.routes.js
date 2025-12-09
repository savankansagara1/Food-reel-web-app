const express = require('express');
const foodPartnerController = require('../controllers/food-partner.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');


const router = express.Router();

// GET /api/foodpartner/:id
router.get(
  "/:id",
  authMiddleware.authUserMiddleware,
  foodPartnerController.getFoodPartnerById
);




module.exports = router;