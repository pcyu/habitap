// users router
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
const moment = require('moment');
const passport = require('passport');
const path = require('path');
const router = express.Router();
const {JWT_SECRET} = require('../config');
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
		res.redirect(`/users/history`)
	})
	.catch(err => {
		return res.status(500).json({message: 'Internal server error.'});
	})
});

//  ===========================================================================
//                                       GET
//  ===========================================================================

router.get('/leaderboard', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.find()
  .then(users => {
    for (var user of users) {
      const todayAnswerFalseArray = (user.habits.filter( function(value){
        return value.active === false
      }))
      var sum = 0;
      for (var habit of todayAnswerFalseArray) {
        habit.score = habit.dailyCheck.map(item=>item.points).reduce((a, b) => a + b, 0);
        sum += habit.score;
      }
      user.elo = sum;
      user.save();
    }
    users.sort(function(a, b) {
      return b.elo - a.elo
    })
    res.render('leaderboard', {
      token: req.app.get('loggedIn'),
      users: users
    });
  });
})

router.get('/history', passport.authenticate('jwt', {session: false}), (req, res) => {
  User
	.findOne({ "username": req.user.username})
	.exec()
	.then( user => {
    const valueFalseArray = (user.habits.filter( function(value){
      return value.active === false
		}))
    valueFalseArray.forEach((habit) => {
			habit.score = habit.dailyCheck.reduce((total, element) => total + element.points, 0);
			habit.historyArray = habit.dailyCheck.map(function(element) {
				if(element.points > -1 ) {
					return {points: "+"+element.points.toString(), date: element.date, questions: habit.questionArray.filter(question => question.revisionDate === element.date)}
				} else {
					return {points: element.points.toString(), date: element.date, questions: habit.questionArray.filter(question => question.revisionDate === element.date)}
				}
			});
			console.log(habit.historyArray.reverse())
			habit.historyArray.reverse();
		})
      if (valueFalseArray.length === 0) {
        res.render(
          'nohistory', {
          username: user.username,
          habits: user.habits,
          token: req.app.get('loggedIn'),
        })
      } 
      else {  
        res.render('history', {
            username: user.username,
            id: user.id,
						habits: valueFalseArray,
            token: req.app.get('loggedIn'),
        });
      }
  });
});

router.get('/dashboard', passport.authenticate('jwt', {session: false}), (req, res) => {
  User
	.findOne({ "username": req.user.username})
	.exec()
	.then( user => {
    const todayAnswerTrueArray = (user.habits.filter( function(value){
       return value.active === true
    }))
    todayAnswerTrueArray.forEach((item) => {
				item.success = (item.dailyCheck.length !== 0) ? item.dailyCheck.filter(yes => yes.points === 1).length : 0;
				item.fail = (item.dailyCheck.length !== 0) ? item.dailyCheck.filter(no => no.points === 0).length : 0;
				item.miss = (item.dailyCheck.length !== 0) ? item.dailyCheck.filter(miss => miss.points === -1).length : 0;
				item.remain = 15 - (item.success + item.fail + item.miss);
		})

      if (todayAnswerTrueArray.length === 0) {
        res.render('nodashboard', {
          username: user.username,
          token: req.app.get('loggedIn'),
        })
      } 
      else {  
        res.render('dashboard', {
            username: user.username,
            id: user.id,
            habits: todayAnswerTrueArray,
            token: req.app.get('loggedIn'),
        });
      }
  })
});

router.get('/new', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.render('new', {
    token: req.app.get('loggedIn')
  });
});

router.get('/:username/dailycheck', passport.authenticate('jwt', {session: false}), (req, res) => {
	User
	.findOne({ "username": req.params.username})
	.exec()
	.then( user => {
		let _habits = user.habits.filter((item, index) => {
			return item.todayAnswer != true && item.active != false;
		});
		const todayAnswerTrueArray = (user.habits.filter( function(value){
			return value.active === true
		}));	
		todayAnswerTrueArray.forEach((item) => {
			item.success = (item.dailyCheck.length !== 0) ? item.dailyCheck.filter(yes => yes === 1).length : 0;
			item.fail = (item.dailyCheck.length !== 0) ? item.dailyCheck.filter(no => no === 0).length : 0;
			item.miss = (item.dailyCheck.length !== 0) ? item.dailyCheck.filter(miss => miss === -1).length : 0;
			item.remain = 15 - (item.success + item.fail + item.miss);
		})
		if (_habits.length === 0) {
			res.render('nodailycheck',{
				username: user.username,
				id: user.id,
				habits: todayAnswerTrueArray,
				token: req.app.get('loggedIn')
			})
		} else {
			res.render('dailycheck', {
				username: user.username,
				id: user.id,
				habits: _habits,
				token: req.app.get('loggedIn')
			})};
	})
})

router.get('/:username/habitstart', passport.authenticate('jwt', {session: false}), (req, res) => {
	User
	.findOne({username: req.params.username})
	.exec()
	.then(
			res.render('habitstart', {
				username: req.params.username,
				token: req.app.get('loggedIn')
			})
	)
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
		.then(
			res.redirect(`/auth/login`)
		)
		.catch(err => {  //c035
				if (err.reason === 'ValidationError') {
					return res.status(err.code).json(err);
				}
				res.status(500).json({code: 500, message: 'Internal server error'});
		});
});

router.post('/new', passport.authenticate('jwt',
{session: false}), (req, res) => {
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
	const beginTime = moment(tracker.goalBegin).format("LL");
	const endTime = moment(tracker.goalEnd).format("LL");
	User.update(
		{"username": req.user.username},
		{
			$push: {
				"habits": {
					active: true,
					endDate: endTime,
					habitId: uuidv1(),
					question: req.body.question,
					startDate: beginTime,
					todayAnswer: true
				}
			}
		}
	)
	.then(
		res.redirect(`/users/${req.user.username}/habitstart`)
	)
	.catch(err => {
		console.error(err);
		return res.status(500).json({message: 'Internal server error'});
	});
});

//  ===========================================================================
//                                       PUT
//  ===========================================================================

// Change Habit Question
router.post('/:username/update/:id/:question', passport.authenticate('jwt',
{session: false}), (req, res) => {
  User.update(
    {username: req.params.username, "habits.habitId": req.params.id},
    { 
			$push: {
			"habits.$.questionArray": {question: req.body.question, revisionDate: moment().format("LL")}
			},
			$set:{
			"habits.$.question": req.body.question
			}
		}
  )
	.then(
		res.redirect(`/users/dashboard`)
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});

router.post('/:username/update/:id', passport.authenticate('jwt',
{session: false}), (req, res) => {
  User.update(
    {username: req.params.username, "habits.habitId": req.params.id},
    { 
			$push: {
			"habits.$.questionArray": {question: req.body.question, revisionDate: moment().format("LL")}
			},
			$set:{
			"habits.$.question": req.body.question
			}
		}
  )
	.then(
		res.redirect(`/users/dashboard`)
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});

router.put('/:username/record/:habitId', passport.authenticate('jwt',
{session: false}), (req, res) => {
	User.update(
    {username: req.params.username, "habits.habitId": req.params.habitId},
    {
			$push: {
				"habits.$.dailyCheck": {points: req.body.habit, date: moment().format("LL")}
			},
			$set: {
				"habits.$.todayAnswer": true
			}
    }
	)
	.then((results) => {
		User.findOne({username: req.params.username}).then(user => {
				for (var habit of user.habits) {
					habit.active = (habit.dailyCheck.length < 15);
				}
				user.save();
			})
	})
	.then( ()=> {
		res.redirect(`/users/${req.user.username}/dailycheck`)
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json({message: 'Internal server error'});
	});
});

module.exports = {router};