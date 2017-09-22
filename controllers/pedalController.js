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

exports.getPedals = async(req, res) => {
	res.render('pedals', {title: 'Pedals'})
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
	console.log(req.file)
	const extension = req.file.mimetype.split('/')[1];
	req.body.image = `${uuid.v4()}.${extension}`;
	// now we resize
	const image = await jimp.read(req.file.buffer);
	await image.resize(600, jimp.AUTO);
	await image.quality(35);
	await image.write(`./public/uploads/${req.body.image}`);
	// once we have written the photo to our filesystem keep going!
	// console.log(req.body.cover);
	next();			
}

exports.processPedalData = (req, res, next) => {
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
	console.log(req.body);
	const pedal = await (new Pedal(req.body)).save();
	req.flash('success', `Successfully Created ${pedal.name}`);
	res.redirect(`/pedal/${pedal.slug}`);		
}