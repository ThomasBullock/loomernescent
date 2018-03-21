const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const albumSchema = new mongoose.Schema({
	title: {
		type: String,
		required: 'You must supply an album title!',
		trim: true
	},
	slug: String,
	releaseDate: {
		type: Date,
		default: Date.now
	},
	artist: {
		type: String,
		required: 'You must supply am artist',
		trim: true
	},
	bandID: {
		type: mongoose.Schema.ObjectId,
		ref: 'Band',
		required: 'You must supply a bandID'
	},
	cover: String,
	producer: [String],
	engineer: [String],
	mixedBy: [String],
	label: String,
	tracks: {
		type: [String],
		required: 'You must include a track listing',
		trim: true
	},
	spotifyURL: String,
	bandcampURL: String,
	comments: String
})

// Define our indexes
albumSchema.index({
	title: 'text',
	producer: 'text',
	mixedBy: 'text'
});
// Pre Save
// Prevent duplicate album names overwritting slugs!
albumSchema.pre('save', async function(next) {
	if(!this.isModified('title')) {
		next(); // skip it
		return // stop
	}
	this.slug = slug(this.title);
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');  // something with a slug and it might end in -1 -2 etc
	// we dont have Album yet because we haven't made it yet - how do we acces the model inside of a models function??	
	const albumsWithSlug = await this.constructor.find({
		slug: slugRegEx
	});
	if(albumsWithSlug.length) {
		this.slug = `${this.slug}-${albumsWithSlug.length + 1}`; 
	} 
	next(); 
})


module.exports = mongoose.model('Album', albumSchema);