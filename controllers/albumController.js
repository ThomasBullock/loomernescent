const mongoose = require('mongoose');
const Band = mongoose.model('Band');
const User = mongoose.model('User');
const Album = mongoose.model('Album');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const request = require('request'); // "Request" library


const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter: function(req, file, next) {  // can remove : function in ES56 syntax
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto) {
		// yes this file is fine continue it on 
			next(null, true) // null means we pass the second value true (yes we're fine)
		} else {
		// or no this file is not allowed
			next({ message: 'That filetype isn\'t allowed!' }, false);		
		}
	}
};

const spotifyOptions = () => {
	return {
		
	}
};

exports.addAlbum = (req, res) => {
	res.render('editAlbum', { title: 'Add Album'})
};

exports.upload = multer(multerOptions).single('cover');

exports.resize = async(req, res, next) => {
	// check if there is no new file to resize (no new file in form means multer will not pass us anything)
	if(!req.file) {
		next()
		return;
	}
	// console.log(req.file)
	const extension = req.file.mimetype.split('/')[1];
	req.body.cover = `${uuid.v4()}.${extension}`;
	// now we resize
	const cover = await jimp.read(req.file.buffer);
	await cover.resize(800, jimp.AUTO);
	await cover.write(`./public/uploads/${req.body.cover}`);
	// once we have written the photo to our filesystem keep going!
	// console.log(req.body.cover);
	next();
}

exports.getArtistData = async(req, res, next) => {
	console.log('we are in getArtistData')
	console.log(req.body.artist)
	const band = await Band.findOne( { name: req.body.artist } )
	
	console.log(band);
	req.body.artist = band._id;
	req.body.artistSpotifyID = band.spotifyID	
	next();
}

exports.getSpotifyData = async(req, res, next) => {
	console.log('we are in spotify')
	if(!req.body.artistSpotifyID) {
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
		// console.log(response)
		if (!error && response.statusCode === 200) {
			console.log('in post request')
	    var token = body.access_token;
	    var options = {
	      url: `https://api.spotify.com/v1/artists/${req.body.artistSpotifyID}/albums`,
	      headers: {
	        'Authorization': 'Bearer ' + token
	      },
	      json: true
	    };
	    request.get(options, function(error, response, body) {
				// console.log(body.items);
				console.log(req.body.title);
				let album;
				for(var i = 0; i < body.items.length; i++) {
					if(body.items[i].name === req.body.title) {
						album = body.items[i];
					}
				}
				// const album = body.items.filter((album) => {
				// 	console.log(album.name);
				// 	return album.name === req.body.title
				// })
				console.log(album.id)
				req.body.spotifyURL = album.external_urls.spotify;
				req.body.spotifyAlbumID = album.id;
				next();
			});			
		} else {
			next();
		}
	}); 
}

exports.createAlbum = async (req, res) => {

	const album = await (new Album(req.body)).save();
	
	req.flash('success', `Successfully Created ${album.title}`);
	res.redirect(`/album/${album.slug}`);
	album			
}

exports.editAlbum = async (req, res) => {
	const album = await Album.findOne( { _id: req.params.id } );
	res.render('editAlbum', { title: `Edit ${album.title}`,  album: album } );	
}



