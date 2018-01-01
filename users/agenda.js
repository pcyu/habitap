const Agenda = require('agenda');
const {User} = require('./model');
const {DATABASE_URL} = require('../config');
const moment = require('moment');

var agenda = new Agenda({db: { address: DATABASE_URL, collection: 'agenda' }});

agenda.define('reset dailyCheck', function(job, done) {
  console.log(moment().format('LLL'));

  User.find()
		.then(users => {
      for (var user of users) {
        for (var habit of user.habits) {
          habit.todayAnswer = true;
        }
      user.save();
      }
    });
    done();
});

// (min hour dayofmonth month dayofweek)

agenda.on('ready', function(){
  agenda.every('42 13 * * *' , 'reset dailyCheck');
  agenda.start();
});