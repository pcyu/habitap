const Agenda = require('agenda');
const {User} = require('./model');
const {DATABASE_URL} = require('../config');

var agenda = new Agenda({db: { address: DATABASE_URL, collection: 'users' }});

agenda.define('reset dailyCheck', function(job, done) {
  console.log("daily check reset!")
  User.update({}, {$set: {firstName: "huehue"}}, {multi: true}, done);

  // User.update({}, {$set: {"habits.$[].todayAnswer":  false}}, {multi: true}, done);

});

agenda.on('ready', function(){
  agenda.every('1 minute', 'reset dailyCheck');
  agenda.start();
});