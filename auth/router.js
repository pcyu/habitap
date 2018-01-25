const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const passport = require('passport');
const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
const config = require('../config');
const app = express();
const {User} = require('../users/model');
app.use(cookieParser());

const createAuthToken = user => {
  return jwt.sign({"user": user.username}, config.JWT_SECRET, {
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

router.get('/success', (req, res) => {
  res.render('success');
})

router.get('/loginfailure', (req, res) => {
  res.render('loginfailure');
})

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
router.post('/register', jsonParser, (req, res) => {
	const requiredFields = ['username', 'password'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
			return res.status(422).json({
					code: 422,
					reason: 'ValidationError',
					message: 'Missing field',
					location: missingField
			});
	}

	const stringFields = ['username', 'password'];
	const nonStringField = stringFields.find(
			field => field in req.body && typeof req.body[field] !== 'string'
	);

	if (nonStringField) {
			return res.status(422).json({
					code: 422,
					reason: 'ValidationError',
					message: 'Incorrect field type: expected string',
					location: nonStringField
			});
	}

	const explicityTrimmedFields = ['username', 'password'];  //c030
	const nonTrimmedField = explicityTrimmedFields.find(
			field => req.body[field].trim() !== req.body[field]
	);

	if (nonTrimmedField) {
			return res.status(422).json({
					code: 422,
					reason: 'ValidationError',
					message: 'Cannot start or end with whitespace',
					location: nonTrimmedField
			});
	}

	const sizedFields = {
			username: {
					min: 1
			},
			password: {
					min: 10,
					max: 72  //c031
			}
	};
	const tooSmallField = Object.keys(sizedFields).find(
			field =>
					'min' in sizedFields[field] &&
					req.body[field].trim().length < sizedFields[field].min
	);
	const tooLargeField = Object.keys(sizedFields).find(
			field =>
					'max' in sizedFields[field] &&
					req.body[field].trim().length > sizedFields[field].max
	);

	if (tooSmallField || tooLargeField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: tooSmallField
				? `Must be at least ${sizedFields[tooSmallField]
					.min} characters long`
				: `Must be at most ${sizedFields[tooLargeField]
					.max} characters long`,
			location: tooSmallField || tooLargeField
		});
	}

	let {username, password} = req.body;  //c032

	return User.find({username})
		.count()
		.then(count => {
			if (count > 0) {
				return Promise.reject({  //c033
					code: 422,
					reason: 'ValidationError',
					message: 'Username already taken',
					location: 'username'
				});
			}
			return User.hashPassword(password);  //c034
		})
		.then(hash => {
			return User.create({
				username,
				password: hash
			});
		})
		.then(user => {res.redirect(`/auth/success`)})
		.catch(err => {  //c035
				if (err.reason === 'ValidationError') {
					return res.status(err.code).json(err);
				}
				res.status(500).json({code: 500, message: 'Internal server error'});
		});
});

router.post(
  '/login',
  // The user provides a username and password to login
  passport.authenticate('local', {
    failureRedirect: '/auth/loginfailure',
    session: false
  }),
(req, res, next) => {
    res.cookie("token", "", { expires: new Date() });
    loggedIn = false;
    const _token = createAuthToken(req.user.apiRepr());
    res.cookie('token', _token);      
    loggedIn = true;
		if (req.user.habits.length < 1) {
			res.redirect('/users/new')
    } else {
      res.redirect(`/users/dailycheck`)
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
