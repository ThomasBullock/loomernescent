const mongoose = require('mongoose');
const Band = mongoose.model('Band');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid'); 
const request = require('request'); // "Request" library

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter: function(req, file, next) {
		console.log(req);
		// console.log(file);
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto) {
		// yes this file is fine continue it on 
			next(null, true) // null means we pass the second value true (yes we're fine)
		} else {
		// or no this file is not allowed
			next({ message: 'That filetype isn\'t allowed!' }, false);		
		}

	}
}

exports.homePage = (req, res) => {
	// req.flash('info', 'Computer Says No...');
	// req.flash('error', 'Computer Says No...');
	// req.flash('success', 'Computer Says No...');		
	res.render('index');
};

exports.addBand = (req, res) => {
	res.render('editBand', { title: 'Add Band'})
};

exports.upload = multer(multerOptions).array('photos', 3); 

exports.resize = async(req, res, next) =>  {  // 
	console.log(req.files);
	// check if there is no new file to resize
	// console.log(req.file)
	if(!req.files) {
		next(); // skip to the next middleware
		return
	}
	const extension = req.files[0].mimetype.split('/')[1];
	req.body.photoLarge = `${uuid.v4()} Lg.${extension}`;
	//now we resize
	const photoLarge = await jimp.read(req.files[0].buffer);
	await photoLarge.resize(800, jimp.AUTO);
	await photoLarge.quality(30);
	await photoLarge.write(`./public/uploads/${req.body.photoLarge}`);

	req.body.photoSmall = `${uuid.v4()} Sm.${extension}`;
	//now we resize
	const photoSmall = await jimp.read(req.files[0].buffer);
	await photoSmall.resize(300, jimp.AUTO);
	await photoSmall.quality(20);
	await photoSmall.greyscale(); 
	await photoSmall.write(`./public/uploads/${req.body.photoSmall}`);

	req.body.gallery = [];
	req.body.gallery.push(`${uuid.v4()} Lg.${extension}`);
	const gallery1 = await jimp.read(req.files[1].buffer);
	await gallery1.resize(1000, jimp.AUTO);
	await gallery1.quality(40);
	await gallery1.write(`./public/uploads/${req.body.gallery[0]}`);

	req.body.galleryThumb = [];
	req.body.galleryThumb.push(`${uuid.v4()} Sm.${extension}`);
	const thumb1 = await jimp.read(req.files[1].buffer);
	await thumb1.resize(400, jimp.AUTO);
	await thumb1.quality(30);
	await thumb1.write(`./public/uploads/${req.body.galleryThumb[0]}`);					
	// once we have written the photo to our filesystem, keep going
	next();

}

exports.getSpotifyData = async(req, res, next) => {
	// if the spotify fields are already filled then next!
	if(req.spotifyID && req.spotifyURL) {
		console.log('skip spotify!')
		next();
		return;
	}

	const client_id = process.env.SPOT_KEY; // Your client id
	const client_secret = process.env.SPOT_SECRET; // Your secret

	// your application requests authorization
	var authOptions = {
	  url: 'https://accounts.spotify.com/api/token',
	  headers: {
	    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
	  },
	  form: {
	    grant_type: 'client_credentials'
	  },
	  json: true
	};

	request.post(authOptions, function(error, response, body) {
	  if (!error && response.statusCode === 200) {

	    // use the access token to access the Spotify Web API
	    var token = body.access_token;
	    var options = {
	      url: `https://api.spotify.com/v1/search?q=${req.body.name}&type=artist&limit=5`,
	      headers: {
	        'Authorization': 'Bearer ' + token
	      },
	      json: true
	    };
	request.get(options, function(error, response, body) {
				if(body.artists.items[0]) {
					req.body.spotifyID = body.artists.items[0].id;		
					req.body.spotifyURL = body.artists.items[0].external_urls.spotify;							
				}
				console.log(error);
				next();
	    });
	  }
	});
}

exports.createBand = async (req, res) => {
	// Record labels are comma seperated
	const recordLabels = req.body.labels.split(',').map( (item) => item.trim() );
	req.body.labels = recordLabels;

	const personnel = req.body.personnel.split(',').map( (item) => item.trim() );
	req.body.personnel = personnel;	
	const pastPersonnel = req.body.pastPersonnel.split(',').map( (item) => item.trim() );
	req.body.pastPersonnel = pastPersonnel;	


	const cleanArray = req.body.yearsActive.split(',').map( (year) => year.trim() );
	req.body.yearsActive = cleanArray.map( (year) => {
		if(year === "present") {
			return "present"
		} else {
			return new Date(year);
		}		
	})	

	// console.log(yearsActive);


	const band = await (new Band(req.body)).save(); // we do it all in one go so we can acces the slug which is generated when saved
	// you can add property/values to band here band.cool = true - wont be in the database until .save()
	// await band.save();
	req.flash('success', `Successfully Created ${band.name}`);
	res.redirect(`/band/${band.slug}`);		


}

exports.getBands = async (req, res) => {
	// 1. Query the database for a list of all bands
	const bands = await Band.find();
	res.render('bands', { title: 'Bands', bands: bands });
}

exports.editBand = async (req, res) => {
	// 1. Find the store given the ID (params)
	const band = await Band.findOne({ _id: req.params.id });
	// 2. confirm they are the owner of the store

	// 3. Render out the edit form so the user can update their store
	res.render('editBand', { title: `Edit ${band.name}`,  band: band } );

}

exports.updateBand = async (req, res) => {
	// set the location data to be a point 
	req.body.location.type = 'Point';

	// find and upadte the band
	const band = await Band.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new: true, // return the new band instead of the old one
		runValidators: true
	}).exec();
	req.flash('success', `Successfully updated <strong>${band.name}</strong>. <a href="/bands/${band.slug}">View Band</a>`)
	// Redirect them to the band and tell them it worked
	res.redirect(`/bands/${band._id}/edit`);
}

exports.getBandBySlug = async (req, res, next) => {
	const band = await Band.findOne({ slug: req.params.slug})
	if(!band) {
		return next();
	}

	res.render('band', { band: band, title: band.name})

}