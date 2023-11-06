const express = require("express");
const checkoutController = require("./../controllers/checkoutController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.post("/checkout-now", checkoutController.getCheckoutSession);

module.exports = router;
