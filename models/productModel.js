const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please enter the product name"],
      maxlength: [
        100,
        `Name length must be equal to or less than 100 characters`,
      ],
      minlength: [
        5,
        `Name length must be equal to or greater than 5 characters`,
      ],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, "A product rating must be equal to or less then 5.0"],
      min: [1, "A product rating must be equal to or above 1.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    category: {
      type: [String],
      required: [true, "Please select products category"],
      enum: [
        "dresses",
        "shirts",
        "hoodies & sweatshirts",
        "sweaters",
        "coats & jackets",
        "jeans",
        "pants",
        "activewear",
        "swimwear",
        "suits",
        "boots",
        "sneakers",
        "heels",
        "accessories",
        "hat",
      ],
    },
    sizes: {
      type: [String],
      enum: ["xxs", "xs", "s", "m", "l", "xl", "xxl", "n/a"],
    },
    sizesShoes: {
      type: [Number],
      enum: [
        5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5,
        13, 13.5, 14, 14.5, 15,
      ],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, `Product must have a price`],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return this.discount ? false : value < this.price;
        },
        message:
          "Discount price must be below original price and can only have one discount type, (set amount or percentage)",
      },
    },
    discount: {
      type: Number,
      validate: {
        validator: function (value) {
          return this.priceDiscount ? false : value < 95;
        },
        message:
          "Discount percentage must be below 95% and can only have one discount type, (set amount or percentage)",
      },
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Product must have a description"],
    },
    images: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, "A product must have a cover image"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Query Middleware
productSchema.pre(/^find/, function (next) {
  this.find({ secretProduct: { $ne: true } });
  this.start = Date.now();
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
