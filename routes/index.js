const express = require('express');
const router = express.Router();
const bandController = require('../controllers/bandController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', bandController.homePage);
router.get('/bands', catchErrors(bandController.getBands));
router.get('/add', bandController.addBand);

router.post('/add', 
	bandController.upload,
	catchErrors(bandController.resize),
	catchErrors(bandController.getSpotifyData),  	 
	catchErrors(bandController.createBand)
	);

router.post('/add/:id',
	bandController.upload,
	catchErrors(bandController.resize),
	catchErrors(bandController.updateBand));

router.get('/bands/:id/edit', catchErrors(bandController.editBand));

router.get('/band/:slug', catchErrors(bandController.getBandBySlug))

module.exports = router;
