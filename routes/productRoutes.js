const express = require("express");
const productController = require("./../controllers/productController");
const authController = require("./../controllers/authController");
const reviewRouter = require("./reviewRoutes");
const router = express.Router();

// Routes
router.use("/:productId/reviews", reviewRouter);

// router.use(authController.isLoggedIn);

router
  .route("/top-5-cheap")
  .get(productController.alliasTopProducts, productController.getAllProducts);
router.route("/product-stats").get(productController.getProductStats);
// router.route("/monthly-plan/:year").get(
//   authController.protect,
//   authController.restrictTo("admin", "lead-guide", "guide"),
//   productController.getMonthlyPlan
// );

// router
//   .route("/tours-within/:distance/center/:latlng/unit/:unit")
//   .get(productController.getToursWithin);
//could also do
// /tours-distance?distance=333&center=-12,43&unit=mi

router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo("seller", "admin"),
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo("seller", "admin"),
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo("seller", "admin"),
    productController.deleteProduct
  );

module.exports = router;
