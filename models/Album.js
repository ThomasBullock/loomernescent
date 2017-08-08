const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

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
	comments: String
})

module.exports = mongoose.model('Album', albumSchema);