const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, "You can't leave a review empty"],
      maxlength: [1500, "Your review must be shorter than 1500 characters"],
      minlength: [1, "Your review must be longer than 5 characters"],
    },
    rating: {
      type: Number,
      default: 0,
      max: [5, "Rating must be equal to or less then 5.0"],
      min: [0, "Rating must be equal to or above 1.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //hides this field from output (user)
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true }); //making sure that User can only leave one review on each product

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  // this
  // .populate({
  //   path: "product",
  //   select: "name",
  // });
  // .populate({
  //   path: "user",
  //   select: "photo",
  // });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].averageRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post(/^findOneAnd/, async function (rev) {
  await rev.constructor.calcAverageRatings(rev.product);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
