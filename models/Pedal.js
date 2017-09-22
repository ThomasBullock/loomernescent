const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const pedalSchema = new mongoose.Schema({
	brand: {
		type: String,
		required: 'You must supply a brand name',
		trim: true		
	},
	name: {
		type: String,
		required: 'You must supply a pedal name',
		trim: true
	},
	slug: String,
	associatedBands: {
		type: [String],
		trim: true
	},
	associatedBandsID: {
		type: mongoose.Schema.ObjectId,
		ref: 'Band'
	},
	yearsManufactured: {
		type: [Date],
		default: Date.now,
		required: 'You must supply a year!'		
	}, 			
	image: String	
})

module.exports = mongoose.model('Pedal', pedalSchema);