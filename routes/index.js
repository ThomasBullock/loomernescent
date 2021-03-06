const express = require("express");
const router = express.Router();
const bandController = require("../controllers/bandController");
const albumController = require("../controllers/albumController");
const pedalController = require("../controllers/pedalController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { catchErrors } = require("../handlers/errorHandlers");

/// BANDS

router.get("/", catchErrors(bandController.homePage));
router.get("/bands", catchErrors(bandController.getBands));
router.get("/bands/page/:page", catchErrors(bandController.getBands));
router.get("/add", bandController.add);
router.get("/addband", authController.isLoggedIn, bandController.addBand); // it will not make it passed isLogged if not logged in

router.post(
  "/addband",
  bandController.upload,
  catchErrors(bandController.resize),
  catchErrors(bandController.getSpotifyData),
  bandController.processBandData,
  catchErrors(bandController.createBand)
);

router.post(
  "/addband/:id",
  bandController.upload,
  catchErrors(bandController.resize),
  bandController.processBandData,
  catchErrors(bandController.updateBand)
);

router.get("/bands/:id/edit", catchErrors(bandController.editBand));
router.get("/band/:slug", catchErrors(bandController.getBandBySlug));

/// ALBUMS

router.get("/albums", catchErrors(albumController.getAlbums));
router.get("/albums/page/:page", catchErrors(albumController.getAlbums));

router.get("/addalbum", authController.isLoggedIn, albumController.addAlbum);

router.post(
  "/addalbum",
  albumController.upload,
  catchErrors(albumController.resize),
  albumController.getArtistData,
  albumController.getSpotifyData,
  albumController.processAlbumData,
  catchErrors(albumController.createAlbum)
);

router.post(
  "/addalbum/:id",
  albumController.upload,
  catchErrors(albumController.resize),
  albumController.getArtistData,
  albumController.getSpotifyData,
  albumController.processAlbumData,
  catchErrors(albumController.updateAlbum)
);

router.get("/album/:id/edit", catchErrors(albumController.editAlbum));
router.get("/album/:slug", catchErrors(albumController.getAlbumBySlug));

//// PEDALS ////

router.get("/pedals", catchErrors(pedalController.getPedals));
router.get("/pedals/page/:page", catchErrors(pedalController.getPedals));
router.get(
  "/pedals/:id/edit",
  authController.isLoggedIn,
  catchErrors(pedalController.editPedal)
);
router.get("/addpedal", authController.isLoggedIn, pedalController.addPedal);

router.post(
  "/addpedal",
  pedalController.upload,
  catchErrors(pedalController.resize),
  pedalController.processPedalData,
  catchErrors(pedalController.createPedal)
);

router.post(
  "/addpedal/:id",
  pedalController.upload,
  catchErrors(pedalController.resize),
  pedalController.processPedalData,
  catchErrors(pedalController.updatePedal)
);

router.get("/pedal/:slug", catchErrors(pedalController.getPedalBySlug));

router.get("/tags", catchErrors(bandController.getBandsByTag));
router.get("/tags/:tag", catchErrors(bandController.getBandsByTag));

router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.get("/register", userController.registerForm);

//1. Validate the registration
//2. register the user
//3. we need to log them in
router.post(
  "/register",
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get("/logout", authController.logout);

router.get("/account", authController.isLoggedIn, userController.account);
router.post("/account", catchErrors(userController.updateAccount));
// router.post(
//   "/accountspurge",
//   catchErrors(userController.getAccountsByQuery),
//   catchErrors(userController.deleteAccounts)
// );
router.post("/account/forgot", catchErrors(authController.forgot));
router.get("/account/reset/:token", catchErrors(authController.reset));
router.post(
  "/account/reset/:token",
  authController.confirmedPasswords,
  catchErrors(authController.update)
);
router.get("/map", bandController.mapPage);

router.get(
  "/favourites",
  authController.isLoggedIn,
  catchErrors(userController.getFavourites)
);

// API ///

router.get("/api/v1/search", catchErrors(bandController.searchBands));
router.get("/api/v1/bands/near", catchErrors(bandController.mapBands));
router.get("/api/v1/bands/all", catchErrors(bandController.mapAllBands));
router.post("/api/v1/bands/:id/loves", catchErrors(bandController.loveBand));
router.post("/api/v1/albums/:id/loves", catchErrors(albumController.loveAlbum));
router.post("/api/v1/pedals/:id/loves", catchErrors(pedalController.lovePedal));

module.exports = router;
