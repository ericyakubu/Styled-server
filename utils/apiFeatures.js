class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    //handle check if on sale
    const onSale = queryObj.onSale;
    if (onSale) {
      queryObj.$or = [
        { discount: { $exists: true } },
        { priceDiscount: { $exists: true } },
      ];

      delete queryObj.onSale;
    }
    //handle sizes query
    const sizes = queryObj.sizes;
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      queryObj.sizes = { $in: sizes };
    }
    //handle shoe sizes query
    const sizesShoes = queryObj.sizesShoes;
    if (sizesShoes && Array.isArray(sizesShoes) && sizesShoes.length > 0) {
      queryObj.sizesShoes = { $in: sizesShoes };
    }
    //handle categories query
    const categories = queryObj.category;
    if (categories && Array.isArray(categories) && categories.length > 0) {
      queryObj.category = { $in: categories };
    }

    if (queryObj.name) queryObj.name = { $regex: queryObj.name, $options: "i" };

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    }
    // else {
    //   this.query = this.query.sort("-createdAt"); //default sorting will be by created date
    // }
    return this;
  }

  limit() {
    //3) Field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields); //only includes requested fields in result
    } else {
      this.query = this.query.select("-__v"); //excludes __v field from results
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    //! needs debugging
    const page = this.queryString.page * 1 || 1; //convert string to number or use default
    const limit = this.queryString.limit * 1 || 18; //convert string to number or use default
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit); //skip = amount of results to be skipped | limit = amount of results to be showed

    return this;
  }
}

module.exports = APIFeatures;
