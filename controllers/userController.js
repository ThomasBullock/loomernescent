const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
	res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
	res.render('register', { title: 'Register' });
}

exports.validateRegister = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('name', 'You must supply a name!').notEmpty();
	req.checkBody('email', 'That Email is not valid!').isEmail();
	req.sanitizeBody('email').normalizeEmail({     /// validator deal with multiple emails mot+test@googlemail.com etc
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
	req.checkBody('password-confirm', 'Confirmed password cannot be blank!').notEmpty();
	req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password); 

	const errors = req.validationErrors(); // will check proceeding methods and returns synchronous errors in the form of an array, 
	// or an object that maps parameter to error in case mapped is passed as true. If there are no errors, the returned value is false.
	if(errors) {
		req.flash('error', errors.map(err => err.msg));
		res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
		return; // stop the fn from running 
	}
	next(); // there were no errors

};

exports.register = async (req, res, next) => {
	const user = new User({ email: req.body.email, name: req.body.name });
	const register = promisify(User.register, User) // see userSchema.plugin in User model for register comes from
	await register(user, req.body.password);
	next(); 
}

