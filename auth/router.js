const cookieParser = require('cookie-parser');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const app = express();
app.use(cookieParser());

const createAuthToken = user => {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

let loggedIn = false;

const router = express.Router();


//  ===========================================================================
//                                       GET
//  ===========================================================================
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
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
//                                      POST
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
    let trueAnswers = req.user.habits.filter((item, index) => {
      return item.todayAnswer === true;
    });
		if (req.user.habits.length < 1) {
			res.redirect('/users/new')
    } else if (req.user.habits.length === trueAnswers.length){
      res.redirect(`/users/dashboard`)
    } else {
      res.redirect(`/users/${req.body.username}/dailycheck`)
    }
  }
);

router.post(
  '/refresh',
  // The user exchanges an existing valid JWT for a new one with a later
  // expiration
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
      const authToken = createAuthToken(req.user);
      res.json({authToken});
  }
);

const isLoggedIn = () => {
  return loggedIn;
}

module.exports = {router, isLoggedIn};
