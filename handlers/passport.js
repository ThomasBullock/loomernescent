// this code is invoked by require ('./handlers/passport'); in app.js

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

// everytime we have a request it going to ask passport what do we 
// do with the user now we have confirmed they are properly logged in
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());