const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  role: {
    type: String,
    enum: ["customer", "seller", "moderator", "admin"],
    default: "customer",
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on save/create
      validator: function (el) {
        return el === this.password; //check if passwords match
      },
      message: "Passwords aren't matching",
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//password encryption
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //if password is not modified - carry on to the next
  this.password = await bcrypt.hash(this.password, 12); //the higher the number (12) the more preasure it'll put on pc (+ will take more time) and the better password will be encrypted
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000; //sometimes token is being issued faster then DB updates, therefore to not cause any issues - substract a second or two
  next();
});

userSchema.pre(/^find/, function (next) {
  // effects everything that starts with User.find
  // "this" points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// check if passwords match
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    // console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }

  // means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //gives 10 min to reset password

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
