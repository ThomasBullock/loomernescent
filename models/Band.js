const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const bandSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	labels: {
		type: [String],
		trim: true		
	},
	personnel: [String],
	pastPersonnel: [String],
	tags: [String], 
	yearsActive: [String],
	created: {
		type: Date,
		default: Date.now
	},
	location: {
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: [{
			type: Number,
			required: 'You must supply coordinates!'
		}],
		address: {
			type: 'String',
			required: 'You must supply a city!'
		}
	},
	photoLarge: String,
	photoSmall: String,
	gallery: [String],
	galleryThumb: [String],
	spotifyID: String,
	spotifyURL: String
});

bandSchema.pre('save', async function(next) {
	if(!this.isModified('name')) {  // only when the band name is changed!
		next(); // skip it
		return // stop
	}
	this.slug = slug(this.name);
	// find other bands that have the same name??
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const bandsWithSlug = await this.constructor.find({ slug: slugRegEx });
	if(bandsWithSlug.length) {
		this.slug = `${this.slug}-${bandsWithSlug.length + 1}`;
	}
	next();
});

module.exports = mongoose.model('Band', bandSchema);