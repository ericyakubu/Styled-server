const Product = require("../models/productModel");
const AppErorr = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

//middleware
exports.alliasTopProducts = (req, res, next) => {
  req.query.limit = "2";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,imageCover,sizes"; //!fix needed (difficulty)
  next();
};

// Rout handlers
exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product, { path: "reviews" });
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$category" }, //groups all results by the difficulty field //!fix needed (difficulty)
        numProducts: { $sum: 1 }, //for each of the documents that goes through the pipeline - 1 will be added to the number
        numRating: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" }, //calculates average rating of all products
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      }, //sorts results by average price
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, //excluding all easy products
    // },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// exports.getToursWithin = catchAsync(async (req, res, next) => {
//   // "/tours-within/:distance/center/:latlng/unit/:unit",
//   const { distance, latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(",");

//   const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; //mi = miles

//   if (!lat || !lng) {
//     next(
//       new AppErorr(
//         "Please provide lattidude and longitude in the format of lat,long",
//         400
//       )
//     );
//   }

//   const tours = await Tour.find({
//     startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
//   });

//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: {
//       data: tours,
//     },
//   });
// });

// exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
//   const year = req.params.year * 1;
//   const plan = await Product.aggregate([
//     {
//       $unwind: "$startDates", //basically creates a document for each starting date (if 1 product had 3 dates there will be 3 same documents with dif dates)
//     },
//     {
//       $match: {
//         startDates: {
//           $gte: new Date(`${year}-01-01`),
//           $lte: new Date(`${year}-12-31`),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: { $month: "$startDates" },
//         numProductStarts: { $sum: 1 },
//         products: { $push: "$name" },
//       },
//     },
//     {
//       $addFields: { month: "$_id" },
//     },
//     {
//       $project: {
//         _id: 0,
//       }, // 0 to remove from result 1 to show
//     },
//     {
//       $sort: {
//         _id: 1,
//       },
//     },
//     {
//       $limit: 12, // limits amount of results
//     },
//   ]);
//   res.status(200).json({
//     status: "success",
//     data: {
//       plan,
//     },
//   });
// });
