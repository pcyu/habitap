const Agenda = require('agenda');
const {User} = require('./model');
const {DATABASE_URL} = require('../config');

var agenda = new Agenda({db: { address: DATABASE_URL, collection: 'agenda' }});

agenda.define('reset dailyCheck', function(job, done) {
  console.log("daily check reset!!!!")

  User.find()
		.then(users => {
      for (var user of users) {
        for (var habit of user.habits) {
          habit.todayAnswer = false;
        }
        user.save(function(error, updatedUser) {
          console.log(updatedUser, "updatedUser");
        });
      }
    });
});

agenda.on('ready', function(){
  agenda.every('5 seconds', 'reset dailyCheck');
  agenda.start();
});