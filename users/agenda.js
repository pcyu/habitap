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
          habit.dailyCheck.push(-1);
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
        }
      user.save();
      }
    });
    done();
});
// (min hour dayofmonth month dayofweek)
agenda.on('ready', function(){
  agenda.every('15 07 * * *' , 'catch missed days');
  agenda.every('16 07 * * *' , 'reset dailyCheck');
  agenda.start();
});