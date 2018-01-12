const Agenda = require('agenda');
const {User} = require('./model');
const {DATABASE_URL} = require('../config');
const moment = require('moment');

var agenda = new Agenda({db: { address: DATABASE_URL, collection: 'agenda' }});

agenda.define('catch missed days', function(job, done) {

  User.find()
  .then(users => {
    for (var user of users) {
      for (var habit of user.habits) {
        if (habit.todayAnswer===false && habit.active===true) {
        console.log(moment().format('LLL'), "Pushed missed dailyCheck values into respective arrays")
          habit.dailyCheck.push({points: -1, date: moment().format('LL')});
        }
      }
      user.save();
    }
  });
  done();
});

agenda.define('reset dailyCheck', function(job, done) {
  console.log(moment().format('LLL'), "Reset todayAnswers to false");

  User.find()
		.then(users => {
      for (var user of users) {
        for (var habit of user.habits) {
          habit.todayAnswer = false;
          habit.active = (habit.dailyCheck.length < 15);
        }
      user.save();
      }
    });
    done();
});
// (min hour dayofmonth month dayofweek)
agenda.on('ready', function(){
  // agenda.every('5 seconds', 'catch missed days');
  // agenda.every('10 seconds', 'reset dailyCheck');
  agenda.every('59 23 * * *' , 'catch missed days');
  agenda.every('00 00 * * *' , 'reset dailyCheck');
  agenda.start();
});