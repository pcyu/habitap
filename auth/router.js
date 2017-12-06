const cookieParser = require('cookie-parser');
const express = require('express');
const moment = require('moment');
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
		if (req.user.habits.length < 1) {
      console.log("no habits")
			res.redirect('/users/new')
		} else if (req.user.habits.length > 0) {
      console.log(req.user.habits, "req.user.habits") 
			for (const index of req.user.habits) {
        let notCompletedQuestions = index.dailyCheck.filter(function(item) {return item.answer === "not yet" && item.time === moment().format('LL')})
        console.log(notCompletedQuestions, "notCompletedQuestions")
        for (const subindex of notCompletedQuestions) {
          console.log(subindex.question, "question")
          console.log(subindex.time, "time")
          console.log(subindex.answer, "answer")
        }
			  // index.dailyCheck.forEach(function(object) {
        //   console.log(index.dailyCheck.length, "index")
				//   // if (object.time === moment().format('LL')) {
        //   if (index.dailyCheck.length < 1) { 
        //     console.log(object, "nothing inside this dailycheck array")
				//   } else if (index.dailyCheck.length > 0) {
        //     console.log("users-profile-page")       
        //   }
        // })
      }	
      res.redirect(`/users/${req.body.username}`)
      // res.redirect('/users/history')
    } 
    // else if () {

    // }
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