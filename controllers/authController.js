const passport = require('passport');

exports.login = passport.authenticate('local', {
	failureRedirect: './login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', `You have logged out`)
	res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
	// first check if the user is authenticated

	if(req.isAuthenticated()) {  // this method that is available to us via passport
		next(); /// carry on the are logged
	}
	req.flash('error', 'Ooops you must be logged in to do that ')
	res.redirect('/login');
}