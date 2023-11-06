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
  // Set the allowed origins as an array
  const allowedOrigins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "https://styled-eight.vercel.app",
    "https://styled-ericyakubu.vercel.app",
  ];

  // Check if the request's origin is in the allowed origins array

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  res.setHeader("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// 1) Global Middleware
app.use(helmet());

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limit requests from 1 IP during a certain amount of time
//? const limiter = rateLimit({
//?   max: 100000, //TODO enable it after done
//?   windowMs: 60 * 60 * 1000,
//?   message: "You can only send 100 requests in one hour, please try again later",
//?   // message: "Too many requests from this IP, please try again in an hour",
//? });

//? app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "ratingsQuantity",
      "ratingsAverage",
      "sizes",
      "category",
      "price",
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

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
