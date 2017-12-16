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
const uuidv1 = require('uuid/v1');
const {timer} = require('../helpers');
app.use(methodOverride('_method'));

router.use(cookieParser());

//  ===========================================================================
//                                     DELETE
//  ===========================================================================
router.delete('/:username/delete/:habit', passport.authenticate('jwt',
	{session: false}), (req, res) => {
		console.log(req.params, "req.params")
	User.update(
		{username: req.params.username},
		{
			$pull: {
				habits: {habitId: req.params.habit}
			}
		}
	)
	.exec()
	.then(item => {
		console.log(`204 / The habit has been deleted.`)
		res.redirect(`/users/${req.user.username}/dailycheck`)
	})
	.catch(err => {
		return res.status(500).json({message: 'Internal server error.'});
	})
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
		next();
	} catch (e) {
		console.log('error!');
		next();
	}
};

router.get('/', (req, res) => {  //c029
  return User.find()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:username/dailycheck', verifyUser, (req, res) => {
	// TODO check here to make sure that the habit falls within Start and End dates
	if (req.validUser) {
		User
		.findOne({ "username": req.params.username})
		.exec()
		.then( user => {
			let _habits = user.habits.filter((item, index) => {
				return item.todayAnswer != true;
			});

			res.render('dailycheck', {
				firstName: user.firstName,
				username: user.username,
				id: user.id,
				habits: _habits,
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

router.get('/:username', verifyUser, (req, res) => {
	if (req.validUser) {
		User
		.findOne({ "username": req.params.username})
		.exec()
		.then( user => {
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

router.post('/new', verifyUser, (req, res) => {
  const requiredFields = ['question'];
	for(let i = 0; i < requiredFields.length; i++) {
	  const field = requiredFields[i];
	  if(!(field in req.body)) {
			const message = `The value for \`${field}\` is missing.`
			console.error(message);
			return res.status(400).send(message);
	  }
	}
	const tracker = timer(true);
	User.update(
		{"username": req.user.username},
		{
			$push: {
				"habits": {
					active: true,
					endDate: tracker.goalEnd,
					habitId: uuidv1(),
					question: req.body.question,
					startDate: tracker.goalBegin,
					todayAnswer: false
				}
			}
		}
	)
	.then(
		res.redirect(`/users/${req.user.username}/dailycheck`)
	)
	.catch(err => {
		console.error(err);
		return res.status(500).json({message: 'Internal server error'});
	});
});


//  ===========================================================================
//                                       PUT
//  ===========================================================================
router.put('/:username/delete/:habit', passport.authenticate('jwt',
	{session: false}), (req, res) => {
	User.update(
		{username: req.params.username},
		{
			$pull: {
				habits: {habitId: req.params.habit}
			}
		}
	)
	.exec()
	.then(item => {
		console.log(`204 / The habit has been deleted.`)
		res.redirect(`/users/${req.user.username}/dailycheck`)
	})
	.catch(err => {
		return res.status(500).json({message: 'Internal server error.'});
	})
});

// router.put('/:username/:habit/:question', passport.authenticate('jwt', {
// 	session: false}), (req, res) => {
// 	User.update(
// 		{ "username": req.params.username},
// 		{
// 			$push:
// 			{
// 				"dailyCheck":
// 				{
// 					answer: req.body.habit,
// 					id: req.params.habit,
// 					question: req.params.question
// 				}
// 			}
// 		}
// 	)
// 	.then(
// 		res.redirect('/history')
// 	)
// 	.catch(err => {
// 		console.error(err);
// 		return res.status(500).json({message: 'Internal server error'});
// 	});
// });

// Change Habit Question
router.post('/:username/update/:id/:question', verifyUser, (req, res) => {
	console.log(req.params.id, "req.params.id")
  User.update(
    {username: req.params.username, "habits.habitId": req.params.id},
    { $set:
      {"habits.$.question": req.body.question}
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

router.put('/:username/record/:habitId', verifyUser, (req, res) => {
  User.update(
    {username: req.params.username, "habits.habitId": req.params.habitId},
    {
			$push: {
				"habits.$.dailyCheck": req.body.habit
			},
			$set: {
				"habits.$.todayAnswer": true
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

module.exports = {router};
