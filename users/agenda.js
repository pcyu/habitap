const Agenda = require('agenda');
const {User} = require('./model');
const {DATABASE_URL} = require('../config');

var agenda = new Agenda({db: { address: DATABASE_URL, collection: 'users' }});

agenda.define('reset dailyCheck', function(job, done) {
  console.log("daily check reset!")
  User.update({$set: {"habits.todayAnswer": false}}, done);
});

agenda.on('ready', function(){
  agenda.every('2 minutes', 'reset dailyCheck');
  agenda.start();
});