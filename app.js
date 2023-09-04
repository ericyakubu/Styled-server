const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const checkoutRouter = require("./routes/checkoutRoutes");

const app = express();

// Set up CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  // res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5174");
  // You can also set it to '*' to allow requests from any origin, but this is less secure:
  // res.setHeader("Access-Control-Allow-Origin", "*");

  // Other CORS headers to allow various types of requests
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Allow credentials (if applicable)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Handle preflight request
  if (req.method === "OPTIONS") {
    // Respond to the preflight request
    return res.sendStatus(200);
  }

  next();
});

// 1) Global Middleware
// set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limit requests from 1 IP during a certain amount of time
//TODO add again
//? const limiter = rateLimit({
//?   max: 100000, //TODO enable it after done
//?   windowMs: 60 * 60 * 1000,
//?   message: "You can only send 100 requests in one hour, please try again later",
//?   // message: "Too many requests from this IP, please try again in an hour",
//? });

//? app.use("/api", limiter);

// body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" })); // accepts requests with body of <= 10kb
app.use(cookieParser());

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
// ? help fix issues that may arrise when quering for same thing multiply times.
// ? for expample - sort=price&sort=duration shouldn't be seperated and go as one sort=price, duration and that will fix it
// ? on the other hand, we may want to get different products that will last either 5 or 9 days, which then would require us to query duration=5&duration=9, therefore we whitelist it
app.use(
  hpp({
    whitelist: [
      "duration", //! needs to be adjusted
      "ratingsQuantity",
      "ratingsAverage",
      "sizes",
      "category",
      "maxGroupSize", //! needs to be adjusted
      "difficulty", //! needs to be adjusted
      "price",
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // // console.log(req.cookies);
  next();
}); // --------> how would an actual middleware look like if were to build myself

// Routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/checkout", checkoutRouter);

app.all("*", (req, res, next) => {
  //all includes get/post/patch/delete, etc.
  next(new AppError(`Can't find ${req.originalUrl}`, 404)); //only error should be passed in the 'next' function
});

app.use(globalErrorHandler);

module.exports = app;
