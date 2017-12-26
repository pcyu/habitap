const Agenda = require('agenda');
const {User} = require('./model');
const {DATABASE_URL} = require('../config');

var agenda = new Agenda({db: { address: DATABASE_URL, collection: 'users' }});

agenda.define('reset dailyCheck', function(job, done) {
  console.log("daily check reset!!!")

  //toggle to test if first name gets changed
  // User.update({}, {$set: {firstName: "hellokitty"}}, {multi: true}, done);

  //with multi true
  // User.updateMany({}, {$set: {"habits.$[].todayAnswer": false}}, {multi: true}, done);
  
  //following the syntax from slack
  User.updateMany({}, {$set: {"habits.$[].todayAnswer": false}}, done);
});

agenda.on('ready', function(){
  agenda.every('1 minute', 'reset dailyCheck');
  agenda.start();
});

// {username: req.params.username, "habits.habitId": req.params.habitId},
// {
//   $push: {
//     "habits.$.dailyCheck": req.body.habit
//   },
//   $set: {
//     "habits.$.todayAnswer": true
//   }
// }