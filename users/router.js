// users router
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const path = require('path');
const router = express.Router();
const {JWT_SECRET} = require('../config');
const {User} = require('./model');

const app = express();  //c038

router.use(cookieParser());


//  ===========================================================================
//                                     DELETE
//  ===========================================================================
router.delete('/:id', (req, res) => {
  User
    .findByIdAndRemove(req.params.id, function(err, value) {
      if(err) {
        const message = `It appears that the document with id (${req.params.id}) does not exist.`;
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .exec()
    .then( person => {
      const message = `204 / The document with id ${req.params.id} has been deleted`;
      console.log(message);
      return res.json(message).end();
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: 'Internal server error'});
    });
});


//  ===========================================================================
//                                       GET
//  ===========================================================================

router.get('/logout', (req, res) => {
	res.cookie("token", "", {expires: new Date() });
	res.render('logout', {
			user: req.user,
			message: "You are now logged out."
	})
});

function loggedIn(req, res, next) {
	if (req.user) {
			next();
	} else {
			res.redirect('/login');
	}
}

const verifyUser = (req, res, next) => {
	try {
		const token = req.headers.authorization || req.cookies.token;
		// const token = req.cookies.auth;
		const {user} = jwt.verify(token, JWT_SECRET);
		req.user = user;
		req.validUser = req.params.username === user.username ? true : false;
		console.log('yeaaaaaa!');
		next();
	} catch (e) {
		console.log('error!');
		next();
	}
  };

router.get('/:username', verifyUser, (req, res) => {
	if (req.validUser) {
		User
		.findOne({ "username": req.params.username})
		.exec()
		.then( user => {
		// Waleed's code	
		//   if (user.id !== req.user.id) {
		//     res.render('landing')
		//   }
		console.log(user, "kappa")
			res.render('profile', {
				profile: user.firstName,
				id: user.id,
				habits: user.habits[0],
				habits1: user.habits[1],
				habits2: user.habits[2],
				habits3: user.habits[3],
				token: req.app.get('loggedIn')
			});
		})
		
		.catch(err => {
			console.log(err);
			return res.status(500).json({message: 'Internal server error'});
		});
	} else {
		console.log('You are not authorized to view this page.')
		return res.status(500).json({message: 'Internal server error'});
	}
});

router.get('/history', verifyUser, (req, res) => {
	console.log(req, "peter")
	User
	.findOne({ "username": req.params.username})
	.exec()
	.then( user => {
		console.log(user, "fdaf")
		res.render('history', {token: loggedIn}, {
			profile: user.firstName,
			id: user.id,
			habits: user.habits[0],
			habits1: user.habits[1],
			habits2: user.habits[2],
			habits3: user.habits[3],
			token: req.app.get('loggedIn')
		})
	});
});
  
router.get('/new',  passport.authenticate('jwt', {
	session: false}), (req, res) => {
	res.render('new', {
	  token: req.app.get('loggedIn')
	});
  });
  
router.post('/new', passport.authenticate('jwt', {
	session: false}), (req, res) => {
	  const requiredFields = ['question'];
	for(let i = 0; i < requiredFields.length; i++) {
	  const field = requiredFields[i];
	  if(!(field in req.body)) {
		const message = `The value for \`${field}\` is missing.`
		console.error(message);
		return res.status(400).send(message);
	  }
	}
	User.findOneAndUpdate({username: req.user.username}, {$push: {habits: req.body.question}})
	  .then(
			res.redirect('/users/history')
	  )
	  .catch(err => {
		console.error(err);
		return res.status(500).json({message: 'Internal server error'});
	  });
  });

router.get('/', (req, res) => {  //c029
  return User.find()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:id', (req, res) => {
	User
		.findById(req.params.id)
		.exec()
		.then( user => {
				console.log(user._id)
			res.json({
				user: user._id
			})
		})
		.catch(err => {
			console.log(err);
			return res.status(500).json({message: 'Internal server error'});
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

	const stringFields = ['username', 'password', 'firstName', 'lastName'];
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

	let {username, password, firstName = '', lastName = ''} = req.body;  //c032
	firstName = firstName.trim();
	lastName = lastName.trim();

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
						password: hash,
						firstName,
						lastName
				});
		})
		.then(user => {
				return res.status(201).json(user.apiRepr());
		})
		.catch(err => {  //c035
				if (err.reason === 'ValidationError') {
						return res.status(err.code).json(err);
				}
				res.status(500).json({code: 500, message: 'Internal server error'});
		});
});


//  ===========================================================================
//                                       PUT
//  ===========================================================================
// TODO change to users
router.put('/persons/:id', (req, res) => {
  if(req.params.id !== req.body.id) {
    const message = `The request path (${req.params.id}) and the request body id (${req.body.id}) must match.`;
    console.error(message);
    return res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['name', 'habits', 'id'];
  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  User
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then( person => res.json(204).end() )
    .catch(err => {
      console.error(err);
      return res.status(500).json({message: 'Internal server error'})
    });
});

module.exports = {router};
