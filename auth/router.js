const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../config');

const createAuthToken = user => {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const router = express.Router();

router.post(
    '/login',
    // The user provides a username and password to login
    passport.authenticate('local', {
      failureRedirect: '/',
      session: false
    }),
    (req, res) => {
        console.log("choke", req.user._id);
        const _token = createAuthToken(req.user.apiRepr());
        const profile = {
          username: req.user.username,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          id: req.user._id,
        }
        res.cookie('token',_token);
        res.cookie('token2', req.user._id);          
        // res.json({profile}); 
        // res.render('profile', {
        //   firstName: req.user.firstName,
        //   lastName: req.user.lastName
        // res.redirect(`/profile?username=${req.user.username}`);
        res.redirect(`/profile/${req.user.username}`);
        // });
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

module.exports = {router};
