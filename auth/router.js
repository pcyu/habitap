const config = require('../config');
const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const passport = require('passport');
const app = express();
const router = express.Router();
app.use(cookieParser());


//  ===========================================================================
//                                       AUTH
//  ===========================================================================

const createAuthToken = user => {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

let loggedIn = false;

//  ===========================================================================
//                                       GET
//  ===========================================================================

router.get('/login', (req, res) => {
  res.render('login');
});
  
router.get('/logout', (req, res) => {
  res.cookie("token", "", { expires: new Date() });
  loggedIn = false;
  res.render('landing', {
    message: "You are now logged out.",
    token: loggedIn
  });
});

//  ===========================================================================
//                                       POST
//  ===========================================================================

router.post(
  '/login',
  // The user provides a username and password to login
  passport.authenticate('local', {    
    failureRedirect: '/auth/login',
    session: false
  }),
  (req, res, next) => {
    const _token = createAuthToken(req.user.apiRepr());
    res.cookie('token', _token);        
    loggedIn = true;
    // c041
		if (req.user.habits.length < 1) {
			res.redirect('/users/new')
		} else {
      res.redirect(`/users/${req.body.username}`)
    }
  }
);

const isLoggedIn = () => {
  return loggedIn;
}

module.exports = {router, isLoggedIn};