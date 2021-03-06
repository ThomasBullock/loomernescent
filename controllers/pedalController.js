const mongoose = require("mongoose");
const Band = mongoose.model("Band");
const Pedal = mongoose.model("Pedal");
const User = mongoose.model("User");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, next) {
    // can remove : function in ES56 syntax
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      // yes this file is fine continue it on
      next(null, true); // null means we pass the second value true (yes we're fine)
    } else {
      // or no this file is not allowed
      next({ message: "That filetype isn't allowed!" }, false);
    }
  },
};

const getBandFromPersonnel = async (artist) => {
  const band = await Band.find({ personnel: { $in: [artist] } });
  return band.slug;
};

exports.getPedals = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = limit * page - limit;

  const pedalsPromise = Pedal.find().skip(skip).limit(limit);

  const countPromise = Pedal.count();

  const [pedals, count] = await Promise.all([pedalsPromise, countPromise]);

  const pages = Math.ceil(count / limit);
  if (!pedals.length && skip) {
    req.flash(
      "info",
      `Hey! You aked for page ${page}. But that doesn't exist So I put you on page ${pages}`
    );
    res.redirect(`/pedals/page/${pages}`);
    return;
  }
  res.render("pedals", {
    title: "Pedals",
    pedals: pedals,
    page: page,
    pages: pages,
    count: count,
  });
};

exports.addPedal = (req, res) => {
  res.render("editPedal", { title: "Add Pedal" });
};

exports.upload = multer(multerOptions).single("image");

exports.resize = async (req, res, next) => {
  if (!req.file) {
    console.log("no new file @ resize");
    next();
    return;
  }
  const extension = req.file.mimetype.split("/")[1];
  const brand = req.body.brand.split(" ")[0];
  req.body.image = `${req.body.brand.split(" ")[0]}-${uuid.v4()}.${extension}`;
  // now we resize
  const image = await jimp.read(req.file.buffer);
  await image.resize(800, jimp.AUTO);
  await image.quality(44);
  await image.write(`./public/uploads/pedals/${req.body.image}`);
  // once we have written the photo to our filesystem keep going!
  next();
};

exports.processPedalData = async (req, res, next) => {
  const artists = req.body.associatedArtists
    .split(",")
    .map((item) => item.trim());
  const bands = await Band.find(
    { personnel: { $in: artists } },
    { name: 1, slug: 1, personnel: 1 }
  );

  const bandsArray = bands.reverse().map((band) => band.name);
  const bandsSlugArray = bands.map((band) => band.slug);

  req.body.associatedBandsSlug = bandsSlugArray;
  req.body.associatedBands = bandsArray;

  let filterBands = [];
  bands.map((band) => {
    // build object containing pedal user their band and band slug
    return band.personnel.map((person) => {
      if (artists.includes(person)) {
        filterBands.push({
          artist: person,
          band: band.name,
          slug: band.slug,
        });
      }
    });
  });

  req.body.usedBy = filterBands;

  if (req.body.type2 === "None") {
    req.body.type2 = null;
  }
  const cleanArray = req.body.yearsManufactured
    .split(",")
    .map((year) => year.trim());
  if (req.body.yearsManufactured) {
    req.body.yearsManufactured = cleanArray.map((year) => {
      return new Date(year);
    });
  } else {
    req.body.yearsManufactured = null;
  }
  next();
};

exports.createPedal = async (req, res) => {
  const pedal = await new Pedal(req.body).save();
  req.flash("success", `Successfully Created ${pedal.name}`);
  res.redirect(`/pedal/${pedal.slug}`);
};

exports.editPedal = async (req, res) => {
  const pedal = await Pedal.findOne({ _id: req.params.id });
  res.render("editPedal", { title: "Edit Pedal", pedal: pedal });
};

exports.updatePedal = async (req, res) => {
  const pedal = await Pedal.findOneAndUpdate({ _id: req.params.id }, req.body, {
    runValidators: true,
  }).exec();
  req.flash(
    "success",
    `Successfully updated <strong>${pedal.name}</strong>. <a href="/pedal/${pedal.slug}">View Pedal</a>`
  );
  res.redirect(`/pedals/${pedal._id}/edit`);
};

exports.getPedalBySlug = async (req, res) => {
  const pedal = await Pedal.findOne({ slug: req.params.slug });
  res.render("pedal", { title: `${pedal.brand} ${pedal.name}`, pedal: pedal });
};

exports.lovePedal = async (req, res) => {
  // have they already loved the band??
  const loves = req.user.loves.map((obj) => obj.toString());

  // if the users loves array includes the pedal.id from the post request we remove it ($pull)
  const operator = loves.includes(req.params.id) ? "$pull" : "$addToSet";
  // otherwise add it to the array $addtoset
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { loves: req.params.id } },
    { new: true }
  );
  res.json(user);
};
