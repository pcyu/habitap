const Agenda = require('agenda');
const {User} = require('./model');
const {DATABASE_URL} = require('../config');
const moment = require('moment');

var agenda = new Agenda({db: { address: DATABASE_URL, collection: 'agenda' }});


	// User.update(
  //   {username: req.params.username, "habits.habitId": req.params.habitId},
  //   {
	// 		$push: {
	// 			"habits.$.dailyCheck": req.body.habit
	// 		},
	// 		$set: {
	// 			"habits.$.todayAnswer": true
	// 		}
  //   }
	// )
	// .then((results) => {
	// 	User.findOne({username: req.params.username}).then(user => {
	// 			for (var habit of user.habits) {
	// 				habit.active = (habit.dailyCheck.length < 15);
	// 			}
	// 			user.save();
	// 		})
	// })


agenda.define('catch missed days', function(job, done) {

  User.find()
  .then(users => {
    for (var user of users) {
      for (var habit of user.habits) {
        if (habit.todayAnswer===false && habit.active===true) {
        console.log(moment().format('LLL'), habit.dailyCheck)
          habit.dailyCheck.push(2);
        }
      }
    user.save();
    }
  });
  done();
});

agenda.define('reset dailyCheck', function(job, done) {
  console.log(moment().format('LLL'), "reset dailyCheck");

  User.find()
		.then(users => {
      for (var user of users) {
        for (var habit of user.habits) {
          habit.todayAnswer = false;
        }
      user.save();
      }
    });
    done();
});

// (min hour dayofmonth month dayofweek)

agenda.on('ready', function(){
  agenda.every('10 seconds' , 'catch missed days');
  agenda.every('46 21 * * *' , 'reset dailyCheck');
  agenda.start();
});