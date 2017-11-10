require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');
const {router: userRouter} = require('./users');
const {router: habitRouter} = require('./habits');

const app = express();

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);
// app.use(bodyParser.json());  // this works with jQuery's AJAX
app.use(bodyParser.urlencoded({  // but when we are using native browser methods, we need this
  extended: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set our paths
app.use('/dist', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/src', express.static(__dirname + '/src'));

// set our endpoints
app.get('/', (req, res) => {
  res.render('landing');
});
app.use('/auth', authRouter);
// app.use('/habits', habitRouter);
app.use('/users', userRouter);

// app.get('/habit', passport.authenticate('jwt', {
//   session: false}), (req, res) => {
//     res.sendFile(__dirname+'/src/templates/habit.html');
//   }
// );



app.use('*', (req, res) => {
  return res.status(404).json({
    message: 'Not Found'
  });
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  let promise = new Promise( (resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if(err) {
        return reject(err);
      }
      server = app.listen(port, () => {

        console.log(`The server is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
  return promise;
}

function closeServer() {
  return mongoose.disconnect()
    .then( () => {
      let promise = new Promise( (resolve, reject) => {
        console.log('Closing server...');
        server.close(err => {
          if(err) {
            return reject(err);
          }
          resolve();
        })
      });
      return promise;
    });
}

if(require.main === module) {
  runServer()
  .catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
