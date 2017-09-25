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
	type: String,
	type2: String,
	usedBy: [
		{
			artist: String,
			band: String,
			slug: String
		}
	],
		
	
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

pedalSchema.pre('save', async function(next) {
	if(!this.isModified('name')) {  // only when the band name is changed!
		next(); // skip it
		return // stop
	}	
	
	this.slug = slug(`${this.brand}-${this.name}`);
	
	next();		
});

module.exports = mongoose.model('Pedal', pedalSchema);