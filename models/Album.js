const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const albumSchema = new mongoose.Schema({
	title: {
		type: String,
		required: 'You must supply an album title!'
	},
	slug: String,
	released: {
		type: Date,
		default: Date.now
	},
	artist: {
		type: mongoose.Schema.ObjectId,
		ref: 'Band',
		required: 'You must supply a band'
	},
	cover: String,
	producer: [String],
	engineer: [String],
	mixer: [String],
	label: String,
	// tracks: {
	// 	type: [String],
	// 	required: 'You must include a track listing'
	// },
	spotifyURL: String,
	comments: String
})

module.exports = mongoose.model('Album', albumSchema);