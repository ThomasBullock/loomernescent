const express = require('express');
const router = express.Router();
const bandController = require('../controllers/bandController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', bandController.homePage);
router.get('/bands', catchErrors(bandController.getBands));
router.get('/add', bandController.addBand);

router.post('/add', 
	bandController.upload,
	catchErrors(bandController.resize),
	catchErrors(bandController.getSpotifyData),
	bandController.processBandData,  	 
	catchErrors(bandController.createBand)
	);

router.post('/add/:id',
	bandController.upload,
	catchErrors(bandController.resize),
	bandController.processBandData, 	
	catchErrors(bandController.updateBand));

router.get('/bands/:id/edit', catchErrors(bandController.editBand));

router.get('/band/:slug', catchErrors(bandController.getBandBySlug));

router.get('/tags', catchErrors(bandController.getBandsByTag));
router.get('/tags/:tag', catchErrors(bandController.getBandsByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

//1. Validate the registration
//2. register the user 
//3. we need to log them in
router.post('/register', 
	userController.validateRegister,
	userController.register,
	authController.login 
	);

module.exports = router;
