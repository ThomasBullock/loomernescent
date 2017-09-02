const mongoose = require('mongoose');
const Band = mongoose.model('Band');
const Album = mongoose.model('Album');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid'); 
const request = require('request'); // "Request" library

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter: function(req, file, next) {
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

exports.add = (req, res) => {
	res.render('add', {title: 'Add'})
}

exports.addBand = (req, res) => {
	res.render('editBand', { title: 'Add Band'})
};

exports.upload = multer(multerOptions).array('photos', 4); 

exports.processPhotos = (req, res, next) => {
	if(req.files.length === 0) {
		next(); // skip to the next middleware
		return
	}	
	console.log('we process files')
	req.files.forEach((file)=> {
		console.log(file);
	})
	next();
}

exports.resize = async(req, res, next) =>  {  // 
	console.log('there are' + req.files.length);
	// check if there is no new file to resize
	// console.log(req.files)
	if(req.files.length === 0) {
		next(); // skip to the next middleware
		return
	}

	req.body.photos = {
		gallery: [],
		galleryThumbs: []
	};

	//now we resize for large
	for(let i = 0; i < req.files.length; i++) {
		// get file extension
		const extension = req.files[i].mimetype.split('/')[1];

		// check if photo is square
		const checkDimensions = await jimp.read(req.files[i].buffer);
		if(checkDimensions.bitmap.width === checkDimensions.bitmap.height) {
			console.log('Its square!');
			const uniqueID = uuid.v4();
			req.body.photos.squareLg = `${uniqueID}_Lg.${extension}`;
			const photoLarge = await jimp.read(req.files[i].buffer);			
			await photoLarge.resize(800, jimp.AUTO);
			await photoLarge.quality(30);
			await photoLarge.write('./public/uploads/' + req.body.photos.squareLg);

			req.body.photos.squareSm = `${uniqueID}_Sm.${extension}`;
			const photoSmall = await jimp.read(req.files[i].buffer);			
			await photoSmall.resize(300, jimp.AUTO);
			await photoSmall.quality(25);
			await photoSmall.write('./public/uploads/' + req.body.photos.squareSm);
		} else {
			const uniqueID = uuid.v4();
			req.body.photos.gallery.push(`${uniqueID}_Lg.${extension}`);
			const gallery = await jimp.read(req.files[i].buffer);
			await gallery.resize(1000, jimp.AUTO);
			await gallery.quality(40);
			await gallery.write(`./public/uploads/${req.body.photos.gallery[req.body.photos.gallery.length - 1]}`);

			req.body.photos.galleryThumbs.push(`${uniqueID}_Sm.${extension}`);
			const thumb = await jimp.read(req.files[i].buffer);
			await thumb.resize(500, jimp.AUTO);
			await thumb.quality(30);
			await thumb.write(`./public/uploads/${req.body.photos.galleryThumbs[req.body.photos.galleryThumbs.length - 1]}`);			
		}
			// req.body.photos[`Square${index}-Lg`] = `${uuid.v4()}_Lg.${extension}`;			
	}
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
	  if (!error && response.statusCode === 200 && req.body.name) { // no point checking spotify if no name in form
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
			// console.log(body.artists);
				if(body.artists && body.artists.items[0]) {
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
}

exports.processBandData = (req, res, next) => {
	console.log(req.body.yearsActive)		
	const recordLabels = req.body.labels.split(',').map( (item) => item.trim() );
	req.body.labels = recordLabels;
	const personnel = req.body.personnel.split(',').map( (item) => item.trim() );
	req.body.personnel = personnel;
	const pastPersonnel = req.body.pastPersonnel.split(',').map( (item) => item.trim() );
	req.body.pastPersonnel = pastPersonnel;
	const cleanArray = req.body.yearsActive.split(',').map( (year) => year.trim() );
	if(req.body.yearsActive) {
		req.body.yearsActive = cleanArray.map( (year) => {
				return new Date(year);
		});
	} else {
		req.body.yearsActive = null;
	}
	console.log(req.body.yearsActive)					
	next();
}

exports.createBand = async (req, res) => {

	req.body.author = req.user._id;
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

const confirmOwner = (store, user) => {
	if(!user.admin) {
		throw Error('You must own a store in order to edit it')
	} 
}

exports.editBand = async (req, res) => {
	// 1. Find the store given the ID (params)
	const band = await Band.findOne({ _id: req.params.id });
	// 2. confirm they are the owner of the store
	confirmOwner(band, req.user);
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
	req.flash('success', `Successfully updated <strong>${band.name}</strong>. <a href="/band/${band.slug}">View Band</a>`)
	// Redirect them to the band and tell them it worked
	res.redirect(`/bands/${band._id}/edit`);
}

exports.getBandBySlug = async (req, res, next) => {
	const band = await Band.findOne({ slug: req.params.slug}).populate('author');
	const albums = await Album.find( { bandID: band._id } ).sort( {"releaseDate": 1} );
	if(!band) {
		return next();
	}
	res.render('band', { band: band, albums: albums, title: band.name})
}

exports.getBandsByTag = async (req, res) => {
	const tag = req.params.tag;
	const tagQuery = tag || { $exists: true };
	const tagsPromise = Band.getTagsList();
	const bandPromise = Band.find({ tags: tagQuery });
	// wait for multiple promises to come back
	const [tags, bands] = await Promise.all([tagsPromise, bandPromise]);
	// var tags = result[0];  // because above we use destructuring these two lines are not needed
	// var bands = result[1];
	// console.log(Object.keys(tag))
	res.render('tags', {tags : tags, title: 'Tags', tag: tag, bands: bands});
}

exports.searchBands = async (req, res) => {
	// const query = req.query;
	const bands = await Band
	// first find bands that match
	.find({
		$text: {
			$search: req.query.q
		}
	}, {
		score: {$meta: 'textScore' }
	})
	// then sort them
	.sort({
		score: { $meta: 'textScore' }	
	})
	.limit(10);
	res.json(bands)
}

exports.mapBands = async (req, res) => {
	const coordinates = [req.query.lng, req.query.lat].map(parseFloat); // change string to numbers

	const q = {
		location: {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates
				},
				$maxDistance: 20000
			}
		}
	}
	// const projection
	
	const bands = await Band.find(q).select('slug name description location photos').limit(10);
	res.json(bands)
};

exports.mapPage = (req, res) => {
	res.render('map', { title: 'Map'});
}

exports.loveBand = async (req, res) => {
	// have they already loved the band??
	const loves = req.user.loves.map(obj => obj.toString());
	// if the users loves array includes the band.id from the post request we remove it ($pull) 
	// otherwise add it to the array $addtoset
	const operator = loves.includes(req.params.id) ? '$pull' : '$addToSet'; 
	const user = await User
		.findByIdAndUpdate(req.user._id, 
			{ [operator]: { loves: req.params.id }},
			{ new: true }
		);
		res.json(user)
}

exports.getFavourites = async (req, res) => {
	// we could query the current user and call .populate on their loves
	
	// or we could query a bunch of bands and find those bands whose ID is in our current love array
	const bands = await Band.find({
		_id: { $in: req.user.loves } // it will find any bands where their ID is in an array (req.user.loves)
	});
	res.render('bands', {title: 'My Favourites', bands });
}
