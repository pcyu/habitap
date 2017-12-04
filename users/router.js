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
const {Habit} = require('./model');
const {User} = require('./model');
const app = express();  //c038
const methodOverride = require('method-override');
const moment = require('moment');
app.use(methodOverride('_method'));
router.use(cookieParser());

//  ===========================================================================
//                                     DELETE
//  ===========================================================================
router.delete('/:username/delete/:habit', passport.authenticate('jwt', {
	session: false}), (req, res) => {
	console.log(req, "req2")
	User.update(
		{username: req.params.username}, 
		{
				$pull: {
					"habits": { _id: req.params.habit}
				}
			}
	)
	.then(
		res.redirect(`/users/update`)
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});


//  ===========================================================================
//                                       GET
//  ===========================================================================

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
		console.log(user.habits, "user")
		for (let i = 0; i < user.habits.length; i++) {
			for (let t = 0; t < user.habits[i].dailyCheck.length; t++) {
				console.log(user.habits[i].dailyCheck[t].time, "time")
				console.log(user.habits[i].dailyCheck[t].answer, "ans")
				if (user.habits[i].dailyCheck[t].time === moment().format('LL')) {
					res.redirect('/users/history')
				}
			}
		}	
			res.render('profile', {
				firstName: user.firstName,
				username: user.username,
				id: user.id,
				habits: user.habits,
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
})

router.get('/', (req, res) => {  //c029
  return User.find()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
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
			console.log
			res.render('registersuccess', {
				username: user.username
			});
		})	
		.catch(err => {  //c035
				if (err.reason === 'ValidationError') {
						return res.status(err.code).json(err);
				}
				res.status(500).json({code: 500, message: 'Internal server error'});
		});
});

router.post('/:username/:habit/:question', passport.authenticate('jwt', {
	session: false}), (req, res) => {
	console.log(req.params, "matt")
	User.update({ "username": req.params.username},  
						{ $push: { "dailyCheck": { id: req.params.habit, question: req.params.question, answer: req.body.habit} } }
	)
	.then(
		res.redirect('/users/history')
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});

router.post('/new', verifyUser, (req, res) => {
		console.log(req, "REQ")
	  const requiredFields = ['question'];
	for(let i = 0; i < requiredFields.length; i++) {
	  const field = requiredFields[i];
	  if(!(field in req.body)) {
		const message = `The value for \`${field}\` is missing.`
		console.error(message);
		return res.status(400).send(message);
	  }
	}
	User.update(
		{"username": req.user.username}, 
		{
			$push: {
				"habits": {
					question: req.body.question
				}
			}
		}
	)
	.then(
		res.redirect(`/users/${req.user.username}`)
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});


//  ===========================================================================
//                                       PUT
//  ===========================================================================
// TODO change to users
router.put('/:username/update/:habit_id', verifyUser, (req, res) => {
	console.log(req.params, "update")
  User.update(
    {username: req.params.username, "habits._id": req.params.habit_id},
    { $push: 
      {"habits.$.dailyCheck": {answer: req.body.habit, time: moment().format('LL')}}
    }
  )
	.then(
		res.redirect(`/users/${req.user.username}`)
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});

router.put('/:username/record/:habit_id', verifyUser, (req, res) => {
	console.log(req.params, "update")
  User.update(
    {username: req.params.username, "habits._id": req.params.habit_id},
    { $push: 
      {"habits.$.dailyCheck": {answer: req.body.habit, time: moment().format('LL')}}
    }
  )
	.then(
		res.redirect(`/users/${req.user.username}`)
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});

module.exports = {router};