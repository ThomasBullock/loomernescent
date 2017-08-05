const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise; // this suppresses an error in terminal we shouldn't have to do it
const md5 = require('md5'); // for gravatar
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose'); 

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, 'Invalid Email Address'],
		required: 'Please Supply an email address'
	},
	name: {
		 type: String,
		 required: 'Please supply a name',
		 trim: true
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	loves: [
		{ type: mongoose.Schema.ObjectId, ref: 'Band'}
	],
	admin: {
		type: Boolean,
		default: false
	}
});

userSchema.virtual('gravatar').get(function(){
	// return `https://img.discogs.com/gQviyg4SN7DHfgVoesc5xAd529U=/fit-in/300x300/filters:strip_icc():format(jpeg):mode_rgb():quality(40)/discogs-images/A-20085-1131456192.jpeg.jpg`
	const hash = md5(this.email);
	console.log(hash)
	return `https://gravatar.com/avatar/${hash}?s=200`;
})


userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);


module.exports = mongoose.model('User', userSchema);