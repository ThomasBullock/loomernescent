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

const spotifyOptions = (endpoint, token) => {
	const baseUrl = 'https://api.spotify.com/v1/';
	return {
	      url: `${baseUrl}${endpoint}`,
	      headers: {
	        'Authorization': 'Bearer ' + token
	      },
	      json: true		
	}
};

exports.getAlbums = async(req, res) => {
	const page = req.params.page || 1;
	const limit = 12;
	const skip = (limit * page) - limit;
	console.log('getting albums')
	// const albums = await Album.find();
	
	const albumsPromise = Album
		.find()
		.skip(skip)
		.limit(limit);
		
	const countPromise = Album.count();
	
	const [albums, count ] = await Promise.all([albumsPromise, countPromise])
	const pages = Math.ceil(count / limit);
	if(!albums.length && skip) {
		req.flash('info', `Hey! You aked for page ${page}. But that doesn't exist So I put you on page ${pages}`)
		res.redirect(`/albums/page/${pages}`);
		return;
	}	
	res.render('albums', {title: 'Albums', albums: albums, page: page, pages: pages, count: count});
};

exports.addAlbum = (req, res) => {
	res.render('editAlbum', { title: 'Add Album'})
};

exports.upload = multer(multerOptions).single('cover');

exports.resize = async(req, res, next) => {
	// check if there is no new file to resize (no new file in form means multer will not pass us anything)
	if(!req.file) {
		console.log('no new file @ resize');
		next()
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	const bandIn = req.body.artist.split(' ').reduce((accum, next, i, arr) => {
		if(arr.length === 1) {
	  	return next.charAt(0) + next.charAt(1);
	  } else {
	  	if(i === 0) {
	  		return next.charAt(0);
	  	} else {
	    	return accum + next.charAt(0);
	    }
	  }
	}, "");
	req.body.cover = `${bandIn}-${uuid.v4()}.${extension}`;
	// now we resize
	const cover = await jimp.read(req.file.buffer);
	await cover.resize(800, jimp.AUTO);
	await cover.quality(36);
	await cover.write(`./public/uploads/covers/${req.body.cover}`);
	// once we have written the photo to our filesystem keep going!
	// console.log(req.body.cover);
	next();
};

exports.getArtistData = async(req, res, next) => {
	console.log('we are in getArtistData')
	// console.log(req.body.artist)
	const band = await Band.findOne( { name: req.body.artist } )
	
	// console.log(band);
	req.body.bandID = band._id;
	req.body.artistSpotifyID = band.spotifyID
	next();
};

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
		if (!error && response.statusCode === 200) {  // inefficient will do the request un edit album?
			console.log('in post request');
	    var token = body.access_token;
	    var options = spotifyOptions(`artists/${req.body.artistSpotifyID}/albums`, token);
	    // console.log(options);
	    request.get(options, function(error, response, body) {
	    	console.log(response.statusCode)
				let album;
				// console.log(body.items);	
				for(let i = 0; i < body.items.length; i++) {
					// console.log(body.items[i].album_type)
					// console.log(i, body.items[i])
					// console.log(body.items[i].name);	
					if(body.items[i].name === req.body.title) {
						album = body.items[i];

						// console.log(album);
					} else {
						// console.log('')
					}
				}
				// console.log(req.body.title);
				/// so this is callback hell!!!!!
		    if(album) { // if still undefined spotify return no results and we can next();
		    	req.body.spotifyURL = album.external_urls.spotify;
					req.body.spotifyAlbumID = album.id;

		    	console.log('making tracks request');
			    var options = spotifyOptions(`albums/${req.body.spotifyAlbumID}/tracks`, token);
			    request.get(options, (error, response, body) => {
			    	// console.log(body)
			    	req.body.tracks = body.items.map( (track) => {
			    		// console.log(track.name)
			    		return track.name
			    	});
			    next(); 
			    })
			  }	else {
			  	// PERHAPS redundant???
			  	
			  	// console.log('album not found attempting search');
			   //  var options = spotifyOptions(`search?q=${req.body.title}&type=album`, token); //search?q=tania%20bowra&type=artist
			   //  request.get(options, (error, response, body) => {
			   //  	// console.log(body)
						// for(let i = 0; i < body.albums.items.length; i++) {
						// 	// console.log(i, body.albums.items[i])
						// 	// if(body.items[i].name === req.body.title) {
						// 	// 	album = body.items[i];
						// 	// }
						// }			    	
			   //  });			    			  	
			  	next();
			  }
			});
		} else {
			next();
		}
	}); 
};

exports.processAlbumData = (req, res, next) => {
	if(req.body.producer) {
		const producers = req.body.producer.split(',').map( (item) => item.trim() );
		req.body.producer = producers;		
	}
	if(req.body.engineer)	{
		const engineers = req.body.engineer.split(',').map( (item) => item.trim() );
		req.body.engineer = engineers;
	}	 
	if(req.body.mixedBy)	{
		const mixed = req.body.mixedBy.split(',').map( (item) => item.trim() );
		req.body.mixedBy = mixed;
	}

	if (typeof req.body.tracks === 'string') {
		const trackList = req.body.tracks.split(',').map( (item) => item.trim() );
		req.body.tracks = trackList;
	}
	next();	
};

exports.createAlbum = async (req, res) => {
	const album = await (new Album(req.body)).save();
	req.flash('success', `Successfully Created ${album.title}`);
	res.redirect(`/album/${album.slug}`);
};

exports.editAlbum = async (req, res) => {
	const album = await Album.findOne( { _id: req.params.id } );
	res.render('editAlbum', { title: `Edit ${album.title}`,  album: album } );
};

exports.getAlbumBySlug = async (req, res) => {
	// console.log(req.params.slug)
	const album = await Album.findOne( { slug: req.params.slug } );
	const band = await Band.findOne( { _id: album.bandID } );

	res.render('album', { title: album.title , album: album, band: band});
};

exports.updateAlbum = async (req, res) => {
	console.log('we are in update!')
	const album = await Album.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new: true,
		runValidators: true,
	}).exec();
	// console.log(album);
	req.flash('success', `Successfully updated <strong>${album.title}</strong>. <a href="/album/${album.slug}">View Album</a>`)
	res.redirect('/albums');
};

exports.loveAlbum = async (req, res) => {
	console.log('hearting album')
	
	const loves = req.user.loves.map(obj => obj.toString());
	// console.log(loves)
	// if the users loves array includes the band.id from the post request we remove it ($pull) 
	// otherwise add it to the array $addtoset
	const operator = loves.includes(req.params.id) ? '$pull' : '$addToSet';
	const user = await User
		.findByIdAndUpdate( req.user.id, 
			{ [operator] : { loves: req.params.id }},
			{ new: true }
			);
	res.json(user)	
};

exports.searchAlbums = async (req, res) => {
	// const query = req.query;
	const albums = await Album
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
	res.json(albums)		
};
