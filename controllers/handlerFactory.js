const APIFeatures = require("../utils/apiFeatures");
const AppErorr = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppErorr("No document was found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //for required / min/maxlength fields and etc.
    });

    if (!doc) {
      return next(new AppErorr("No document was found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Document was updated",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on product
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    const totalCount = await Model.countDocuments(filter);
    // console.log(number);

    const doc = await features.query;
    // const doc = await features.query.explain(); //shows ALL detailed information about request/query/process

    //send response
    res.status(200).json({
      status: "success",
      totals: totalCount,
      results: doc.length,
      data: doc,
    });
  });

// popOptions = populate options
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppErorr("No document was found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
