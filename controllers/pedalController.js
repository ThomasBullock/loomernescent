const mongoose = require('mongoose');
const Band = mongoose.model('Band');
const Pedal = mongoose.model('Pedal');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid'); 

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

const getBandFromPersonnel = async(artist) => {
	const band = await Band.find({ personnel: {$in: [artist] } })
	console.log('me console the band');
	console.log(band);
	return band.slug;		
}

exports.getPedals = async(req, res) => {
	const page = req.params.page || 1;
	const limit = 2;
	const skip = (limit * page) - limit;
	
	const pedalsPromise = Pedal
		.find()
		.skip(skip)
		.limit(limit)
		
	const countPromise = Pedal.count();
	
	const [ pedals, count ] = await Promise.all([pedalsPromise, countPromise]);
	
	const pages = Math.ceil(count / limit);
	if(!pedals.length && skip) {
		req.flash('info', `Hey! You aked for page ${page}. But that doesn't exist So I put you on page ${pages}`)
		res.redirect(`/pedals/page/${pages}`);
		return;
	}		
	res.render('pedals', {title: 'Pedals', pedals: pedals, page: page, pages: pages, count: count})
}

exports.addPedal = (req, res) => {
	res.render('editPedal', {title: 'Add Pedal'})
}

exports.upload = multer(multerOptions).single('image');

exports.resize = async(req, res, next) => {
	if(!req.file) {
		console.log('no new file @ resize');
		next()
		return;
	}
	// console.log(req.file)
	const extension = req.file.mimetype.split('/')[1];
	req.body.image = `${uuid.v4()}.${extension}`;
	// now we resize
	const image = await jimp.read(req.file.buffer);
	await image.resize(600, jimp.AUTO);
	await image.quality(35);
	await image.write(`./public/uploads/pedals/${req.body.image}`);
	// once we have written the photo to our filesystem keep going!
	// console.log(req.body.cover);
	next();			
}

exports.processPedalData = async(req, res, next) => {
	const artists = req.body.associatedArtists.split(',').map( (item) => item.trim() );
	const bands = await Band.find({ personnel: {$in: artists }}, { name: 1, slug: 1, personnel: 1 });

	const bandsArray = bands.reverse().map( (band) => band.name );	
	const bandsSlugArray = bands.map( (band) => band.slug );

	// console.log(bandsArray)
	// console.log(bandsSlugArray)

	req.body.associatedBandsSlug = bandsSlugArray;
	req.body.associatedBands = bandsArray;
		
	let filterBands = [];
	bands.map( (band) => {  // build object containing pedal user their band and band slug
		return band.personnel.map( (person) => {
			if(artists.includes(person)) {
				filterBands.push({
					artist: person,
					band: band.name,
					slug: band.slug						
				});

			}
		})
	});
		
	req.body.usedBy = filterBands;
		
	if(req.body.type2 === 'None') {
		req.body.type2 = null
	}
	const cleanArray = req.body.yearsManufactured.split(',').map( (year) => year.trim() );
	if(req.body.yearsManufactured) {
		req.body.yearsManufactured = cleanArray.map( (year) => {
				return new Date(year);
		});
	} else {
		req.body.yearsManufactured = null;
	}
	next();	
}

exports.createPedal = async(req, res) => {
	// console.log(req.body);
	const pedal = await (new Pedal(req.body)).save();
	req.flash('success', `Successfully Created ${pedal.name}`);
	res.redirect(`/pedal/${pedal.slug}`);		
}


exports.getPedalBySlug = async(req, res) => {
	const pedal = await Pedal.findOne({ slug: req.params.slug })
	console.log(pedal)
	res.render('pedal', {title: `${pedal.brand} ${pedal.name}`, pedal: pedal })
}