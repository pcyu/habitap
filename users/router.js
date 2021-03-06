// users router
require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
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
app.use(methodOverride('_method'));
router.use(cookieParser());

//  ===========================================================================
//                                     DELETE
//  ===========================================================================
// router.delete('/:username/delete/:habit', passport.authenticate('jwt',
// 	{session: false}), (req, res) => {
// 	User.update(
// 		{username: req.params.username},
// 		{
// 			$pull: {
// 				habits: {habitId: req.params.habit}
// 			}
// 		}
// 	)
// 	.exec()
// 	.then(item => {
// 		console.log(`204 / The habit has been deleted.`)
// 		res.redirect(`/users/history`)
// 	})
// 	.catch(err => {
// 		return res.status(500).json({message: 'Internal server error.'});
// 	})
// });

router.delete('/:username/del/:habit', passport.authenticate('jwt',
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
		res.redirect(`/users/dashboard`)
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
	.findOne({ "username": req.user})
	.exec()
	.then( user => {
    const valueFalseArray = (user.habits.filter( function(value){
      return value.active === false
		}));
		if (valueFalseArray.length === 0) {
			res.render(
				'nohistory', {
				username: user.username,
				token: req.app.get('loggedIn'),
			})
		} 
		else {
			valueFalseArray.forEach((habit) => {
				habit.score = habit.dailyCheck.reduce((total, element) => total + element.points, 0);
				habit.historyArray = habit.dailyCheck.map(function(element) {
					if (element.points > -1 ) {
						return {points: "+"+element.points.toString(), date: element.date, questions: habit.questionArray.filter(question => question.revisionDate === element.date)}
					} else {
						return {points: element.points.toString(), date: element.date, questions: habit.questionArray.filter(question => question.revisionDate === element.date)}
					}
				});
				if (habit.questionArray.length === 1) {
					for (element of habit.historyArray) {
						element.questions = [];
					};
				}
				habit.historyArray.reverse();
			});  
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
	.findOne({ "username": req.user})
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

router.get('/update/:habitId', passport.authenticate('jwt', {session: false}), (req, res) => {
	User
	.findOne({ "username": req.user})
	.exec()
	.then( user => {
		let habitInformation = user.habits.filter(function(element){
			return element.habitId === req.params.habitId
		});
		for (element of habitInformation) {
			element.questionArray.reverse();
		};
		res.render('update', {
			token: req.app.get('loggedIn'),
			habitInfo: habitInformation,
			id: req.params.habitId
		});
	});
});

router.get('/new', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.render('new', {
    token: req.app.get('loggedIn')
  });
});

router.get('/maxhabits', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.render('max', {
    token: req.app.get('loggedIn')
  });
});

router.get('/dailycheck', passport.authenticate('jwt', {session: false}), (req, res) => {
	User
	.findOne({ "username": req.user})
	.exec()
	.then( user => {
		let _habits = user.habits.filter((item, index) => {
			return item.todayAnswer !== true && item.active !== false;
		});
		for (habit of _habits) {
			habit.day = habit.dailyCheck.length
		}
		if (_habits.length === 0) {
			res.render('nodailycheck',{
				username: user.username,
				id: user.id,
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

router.get('/habitstart', passport.authenticate('jwt', {session: false}), (req, res) => {
	User
	.findOne({username: req.params.username})
	.exec()
	.then(
			res.render('habitstart', {
				username: req.user,
				token: req.app.get('loggedIn')
			})
	)
})


//  ===========================================================================
//                                      POST
//  ===========================================================================
router.post('/new', passport.authenticate('jwt', {session: false}), (req, res) => {
	User.find({"username": req.user})
	.then(user=>{
		for (element of user) {
			var currentHabits = element.habits.filter(item => item.active === true);
			(currentHabits.length > 5) ? res.redirect(`/users/maxhabits`) : 
			User.update(
				{"username": req.user},
				{
					$push: {
						"habits": {
							active: true,
							habitId: uuidv1(),
							question: req.body.question,
							questionArray: {question: req.body.question, revisionDate: moment().format("LL")},
							todayAnswer: true
						}
					}
				}
			)
		.then(
			res.redirect(`/users/habitstart`)
		)
		.catch(err => {
			console.error(err);
			return res.status(500).json({message: 'Internal server error'});
		})
		}
	})
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

router.post('/update/:habitId', passport.authenticate('jwt',
{session: false}), (req, res) => {
  User.update(
    {username: req.user, "habits.habitId": req.params.habitId},
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
		res.redirect(`/users/update/`+req.params.habitId)
	)
	.catch(err => {
	console.error(err);
	return res.status(500).json({message: 'Internal server error'});
	});
});

router.put('/:username/record/:habitId', passport.authenticate('jwt', {session: false}), (req, res) => {
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
		res.redirect(`/users/dailycheck`)
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json({message: 'Internal server error'});
	});
});

module.exports = {router};