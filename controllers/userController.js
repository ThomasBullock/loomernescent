const mongoose = require("mongoose");
const User = mongoose.model("User");
const Band = mongoose.model("Band");
const Album = mongoose.model("Album");
const Pedal = mongoose.model("Pedal");
const promisify = require("es6-promisify");
const mail = require("../handlers/mail");

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("name", "Name too long!").isLength({ max: 25 });
  req.checkBody("email", "That Email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    /// validator deal with multiple emails mot+test@googlemail.com etc
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody("password", "Password Cannot be Blank!").notEmpty();
  req
    .checkBody("password-confirm", "Confirmed password cannot be blank!")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops! Your passwords do not match")
    .equals(req.body.password);
  req
    .checkBody(
      "password",
      "Password must be minimum 8 characters and include a number"
    )
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i");
  const errors = req.validationErrors(); // will check proceeding methods and returns synchronous errors in the form of an array,
  // or an object that maps parameter to error in case mapped is passed as true. If there are no errors, the returned value is false.
  if (errors) {
    req.flash(
      "error",
      errors.map((err) => err.msg)
    );
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash(),
    });
    return; // stop the fn from running
  }
  next(); // there were no errors
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User); // see userSchema.plugin in User model for register comes from
  await register(user, req.body.password);
  await mail.send({
    user: user,
    filename: "welcome", // the name of the pug file to render
    subject: "Welcome to Loomernescent",
    // resetURL: resetURL // this will be sent through to the pug file that is rendered by generateHTML in mail.js
  });
  next();
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit Your Account" });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id }, // import you get the id from the request so it can be fiddled with
    { $set: updates }, // take updates and set it on top of what already exists in user
    { new: true, runValidators: true, context: "query" } /// context is required by mongoose
  );

  req.flash("success", "Updated the profile!");
  res.redirect("back");
};

exports.getFavourites = async (req, res) => {
  // we could query the current user and call .populate on their loves

  const bands = await Band.find({ _id: { $in: req.user.loves } });
  const albums = await Album.find({ _id: { $in: req.user.loves } });
  const pedals = await Pedal.find({ _id: { $in: req.user.loves } });
  // or we could query a bunch of bands and find those bands whose ID is in our current love array
  res.render("favourites", {
    title: "My Favourites",
    bands: bands,
    albums: albums,
    pedals: pedals,
  });
};

/* Get and Delete Accounts for cleaning crap accounts out of DB 

exports.deleteAccounts = async (req, res) => {
  console.log("!!Delete Accounts!!");
  // const condition = new RegExp(`${req.body.match}`, "gm");
  // const deletions = await User.remove({ [req.body.target]: condition });

  req.body.accounts.forEach((account) => {
    User.findByIdAndDelete({ _id: account._id }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted User : ", docs);
      }
    });
  });

  res.sendStatus(204);
};

exports.getAccountsByQuery = async (req, res, next) => {
  console.log("getAccountsByQuery " + req.body.match);
  const condition = new RegExp(`${req.body.match}`, "gm");
  const accounts = await User.find({ [req.body.target]: condition }).exec();

  // By date query
  // const accounts = await User.find({
  //   [req.body.target]: {
  //     $gte: new Date("2019-11-20T04:24:23.370+00:00"),
  //     $lte: new Date("2020-01-12T03:09:38.445+00:00"),
  //   },
  // }).exec();

  req.body.accounts = accounts;

  console.log(accounts);
  next();
};

*/
