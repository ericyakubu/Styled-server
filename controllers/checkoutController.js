const catchAsync = require("../utils/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get products
  const { products } = req.body;

  const formatedProducts = products.map((product) => {
    return {
      price_data: {
        unit_amount: Number((product.price * 100).toFixed(2)), //counts by cents
        currency: "usd",
        product_data: {
          name: `${product.name}`,
          // description: product.description,
          description: ` ${
            product.size ? `Size selected: ${product.size.toUpperCase()}` : ``
          }`,
          images: [product.imageCover],
        },
      },
      quantity: product.quantity,
    };
  });

  // 2) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/`, //home url
    cancel_url: `${req.protocol}://${req.get("host")}/shop`, //home url
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    line_items: formatedProducts,
  });

  //3) Create session as response
  res.status(200).json({
    status: "success",
    session,
  });
});
