const mongoose = require("mongoose");
const Band = mongoose.model("Band");
const Album = mongoose.model("Album");
const User = mongoose.model("User");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");
const request = require("request"); // "Request" library

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, next) {
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

const randomNum = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

// This function will fail if there is not enough band/album  data in the db to populate the hero[]
exports.homePage = async (req, res) => {
  const bands = await Band.find().select("name slug photos");
  const albums = await Album.find().select("title slug cover");

  const hero = [];
  for (let i = 0; i < 24; i++) {
    const select = Math.random() <= 0.6;
    if (select && bands.length > 0) {
      // if true and band list still > 0 pick a band
      const choice = randomNum(0, bands.length);
      const band = bands[choice];
      hero.push({
        type: "band",
        name: band.name,
        slug: band.slug,
        img: band.photos.squareSm,
      });
      bands.splice(choice, 1); // this is an attempt at uniqueness but fails??
    } else {
      const choice = randomNum(0, albums.length);
      const album = albums[choice];
      if (album) {
        hero.push({
          type: "album",
          name: album.title,
          slug: album.slug,
          img: `covers/${album.cover}`,
        });
        albums.splice(choice, 1); // this is an attempt at uniqueness but fails??
      } else {
        continue;
      }
    }
  }
  res.render("index", { title: "Loomernescent", hero });
};

exports.add = (req, res) => {
  res.render("add", { title: "Add" });
};

exports.addBand = (req, res) => {
  res.render("editBand", { title: "Add Band", path: req.path });
};

exports.upload = multer(multerOptions).array("photos", 4);

exports.processPhotos = (req, res, next) => {
  if (req.files.length === 0) {
    next(); // skip to the next middleware
    return;
  }
  console.log("we process files");
  next();
};

exports.resize = async (req, res, next) => {
  //
  console.log("there are" + req.files.length);
  // check if there is no new file to resize
  if (req.files.length === 0) {
    next(); // skip to the next middleware
    return;
  }

  req.body.photos = {
    gallery: [],
    galleryThumbs: [],
  };

  //now we resize for large
  for (let i = 0; i < req.files.length; i++) {
    // get file extension
    const extension = req.files[i].mimetype.split("/")[1];
    const bandIn = req.body.name.split(" ").reduce((accum, next, i, arr) => {
      if (arr.length === 1) {
        return next.charAt(0) + next.charAt(1);
      } else {
        if (i === 0) {
          return next.charAt(0);
        } else {
          return accum + next.charAt(0);
        }
      }
    }, "");
    // check if photo is square
    const checkDimensions = await jimp.read(req.files[i].buffer);
    if (checkDimensions.bitmap.width === checkDimensions.bitmap.height) {
      const uniqueID = uuid.v4();
      req.body.photos.squareLg = `${bandIn}-${uniqueID}_Lg.${extension}`;
      const photoLarge = await jimp.read(req.files[i].buffer);
      await photoLarge.resize(800, jimp.AUTO);
      await photoLarge.quality(38);
      await photoLarge.write("./public/uploads/" + req.body.photos.squareLg);

      req.body.photos.squareSm = `${bandIn}-${uniqueID}_Sm.${extension}`;
      const photoSmall = await jimp.read(req.files[i].buffer);
      await photoSmall.resize(300, jimp.AUTO);
      await photoSmall.quality(32);
      await photoSmall.write("./public/uploads/" + req.body.photos.squareSm);
    } else {
      const uniqueID = uuid.v4();
      req.body.photos.gallery.push(`${bandIn}-${uniqueID}_Lg.${extension}`);
      const gallery = await jimp.read(req.files[i].buffer);
      if (checkDimensions.bitmap.width > checkDimensions.bitmap.height) {
        await gallery.resize(1000, jimp.AUTO);
        await gallery.quality(40);
        await gallery.write(
          `./public/uploads/${
            req.body.photos.gallery[req.body.photos.gallery.length - 1]
          }`
        );
      } else {
        await gallery.resize(jimp.AUTO, 800);
        await gallery.quality(40);
        await gallery.write(
          `./public/uploads/${
            req.body.photos.gallery[req.body.photos.gallery.length - 1]
          }`
        );
      }

      req.body.photos.galleryThumbs.push(
        `${bandIn}-${uniqueID}_Sm.${extension}`
      );
      const thumb = await jimp.read(req.files[i].buffer);
      await thumb.resize(500, jimp.AUTO);
      await thumb.quality(34);
      await thumb.write(
        `./public/uploads/${
          req.body.photos.galleryThumbs[
            req.body.photos.galleryThumbs.length - 1
          ]
        }`
      );
    }
  }
  next();
};

exports.getSpotifyData = async (req, res, next) => {
  // if the spotify fields are already filled then next!
  if (req.spotifyID && req.spotifyURL) {
    console.log("skip spotify!");
    next();
    return;
  }

  const client_id = process.env.SPOT_KEY; // Your client id
  const client_secret = process.env.SPOT_SECRET; // Your secret

  // your application requests authorization
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "client_credentials",
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200 && req.body.name) {
      // no point checking spotify if no name in form
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: `https://api.spotify.com/v1/search?q=${req.body.name}&type=artist&limit=5`,
        headers: {
          Authorization: "Bearer " + token,
        },
        json: true,
      };
      request.get(options, function (error, response, body) {
        if (body.artists && body.artists.items[0]) {
          req.body.spotifyID = body.artists.items[0].id;
          req.body.spotifyURL = body.artists.items[0].external_urls.spotify;
        }
        console.log(error);
        next();
      });
    } else {
      next();
    }
  });
};

exports.processBandData = (req, res, next) => {
  console.log(req.body.yearsActive);
  const recordLabels = req.body.labels.split(",").map((item) => item.trim());
  req.body.labels = recordLabels;
  const personnel = req.body.personnel.split(",").map((item) => item.trim());
  req.body.personnel = personnel;
  const pastPersonnel = req.body.pastPersonnel
    .split(",")
    .map((item) => item.trim());
  req.body.pastPersonnel = pastPersonnel;
  const cleanArray = req.body.yearsActive.split(",").map((year) => year.trim());
  if (req.body.yearsActive) {
    req.body.yearsActive = cleanArray.map((year) => {
      return new Date(year);
    });
  } else {
    req.body.yearsActive = null;
  }
  console.log(req.body.yearsActive);
  next();
};

exports.createBand = async (req, res) => {
  req.body.author = req.user._id;
  const band = await new Band(req.body).save(); // we do it all in one go so we can acces the slug which is generated when saved
  // you can add property/values to band here band.cool = true - wont be in the database until .save()
  req.flash("success", `Successfully Created ${band.name}`);
  res.redirect(`/band/${band.slug}`);
};

exports.getBands = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = limit * page - limit;
  // 1. Query the database for a list of all bands
  const bandsPromise = Band.find().skip(skip).limit(limit);

  const countPromise = Band.count();

  const [bands, count] = await Promise.all([bandsPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!bands.length && skip) {
    req.flash(
      "info",
      `Hey! You aked for page ${page}. But that doesn't exist So I put you on page ${pages}`
    );
    res.redirect(`/bands/page/${pages}`);
    return;
  }
  res.render("bands", {
    title: "Bands",
    bands: bands,
    page: page,
    pages: pages,
    count: count,
  });
};

const confirmOwner = (store, user) => {
  if (!user.admin) {
    throw Error("You must own a store in order to edit it");
  }
};

exports.editBand = async (req, res) => {
  console.log(req.path);
  let path = req.path.split("/");
  path[2] = "[id]";
  path = path.join("/");
  console.log(path);
  // 1. Find the store given the ID (params)
  const band = await Band.findOne({ _id: req.params.id });
  // 2. confirm they are the owner of the store
  confirmOwner(band, req.user);
  // 3. Render out the edit form so the user can update their store
  res.render("editBand", {
    title: `Edit ${band.name}`,
    band: band,
    path: path,
  });
};

exports.updateBand = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = "Point";

  // find and upadte the band
  const band = await Band.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new band instead of the old one
    runValidators: true,
  }).exec();
  req.flash(
    "success",
    `Successfully updated <strong>${band.name}</strong>. <a href="/band/${band.slug}">View Band</a>`
  );
  // Redirect them to the band and tell them it worked
  res.redirect(`/bands/${band._id}/edit`);
};

exports.getBandBySlug = async (req, res, next) => {
  const band = await Band.findOne({ slug: req.params.slug }).populate("author");
  const albums = await Album.find({ bandID: band._id }).sort({
    releaseDate: 1,
  });
  if (!band) {
    return next();
  }
  res.render("band", { band: band, albums: albums, title: band.name });
};

exports.getBandsByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Band.getTagsList();
  const bandPromise = Band.find({ tags: tagQuery });
  // wait for multiple promises to come back
  const [tags, bands] = await Promise.all([tagsPromise, bandPromise]);
  res.render("tags", { tags: tags, title: "Tags", tag: tag, bands: bands });
};

exports.searchBands = async (req, res) => {
  // const query = req.query;
  const bands = await Band
    // first find bands that match
    .find(
      {
        $text: {
          $search: req.query.q,
        },
      },
      {
        score: { $meta: "textScore" },
      }
    )
    // then sort them
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  if (bands.length > 0) {
    res.json(bands);
  } else {
    const albums = await Album.find(
      {
        $text: {
          $search: req.query.q,
        },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      // then sort them
      .sort({
        score: { $meta: "textScore" },
      })
      .limit(10);
    res.json(albums);
  }
};

exports.mapBands = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat); // change string to numbers

  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: 20000,
      },
    },
  };
  // const projection

  const bands = await Band.find(q)
    .select("slug name description location photos")
    .limit(10);
  res.json(bands);
};

exports.mapAllBands = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat); // change string to numbers

  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: 20000,
      },
    },
  };
  // const projection

  const bands = await Band.find().select(
    "slug name description location photos"
  );
  res.json(bands);
};

exports.mapPage = (req, res) => {
  res.render("map", { title: "Map", path: req.path });
};

exports.loveBand = async (req, res) => {
  console.log("loving band!");
  // have they already loved the band??
  const loves = req.user.loves.map((obj) => obj.toString());
  // if the users loves array includes the band.id from the post request we remove it ($pull)
  // otherwise add it to the array $addtoset
  const operator = loves.includes(req.params.id) ? "$pull" : "$addToSet";
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { loves: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.getFavourites = async (req, res) => {
  // we could query the current user and call .populate on their loves

  // or we could query a bunch of bands and find those bands whose ID is in our current love array
  const bands = await Band.find({
    _id: { $in: req.user.loves }, // it will find any bands where their ID is in an array (req.user.loves)
  });
  res.render("bands", { title: "My Favourites", bands });
};
