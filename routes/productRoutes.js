const express = require("express");
const productController = require("./../controllers/productController");
const authController = require("./../controllers/authController");
const reviewRouter = require("./reviewRoutes");
const router = express.Router();

// Routes
router.use("/:productId/reviews", reviewRouter);

router
  .route("/top-5-cheap")
  .get(productController.alliasTopProducts, productController.getAllProducts);
router.route("/product-stats").get(productController.getProductStats);

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
