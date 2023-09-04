const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");
const router = express.Router({ mergeParams: true });

// Routes

// POST /reviews
// POST /products/:productId/reviews
// GET /products/:productId/reviews
// both go here, and thanks to mergeParams we have access to productId in here as well

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("customer"),
    reviewController.setProductUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("customer", "moderator", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("customer", "moderator", "admin"),
    reviewController.deleteReview
  );
module.exports = router;
