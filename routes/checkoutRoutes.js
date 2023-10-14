const express = require("express");
const checkoutController = require("./../controllers/checkoutController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.post(
  "/checkout-now",
  authController.protect,
  checkoutController.getCheckoutSession
);
// router.get(
//   "/checkout-now/:productId",
//   authController.protect,
//   checkoutController.getCheckoutSession
// );
// router.get(
//   "/checkout-cart",
//   authController.protect,
//   checkoutController.getCartCheckoutSession
// );

module.exports = router;
