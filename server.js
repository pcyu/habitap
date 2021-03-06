require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const helpers = require('./helpers');
const methodOverride = require('method-override');
const moment = require('moment');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const {User} = require('./users/model');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('./config');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {router: authRouter, localStrategy, jwtStrategy, isLoggedIn} = require('./auth');
const {router: userRouter} = require('./users');

const app = express();

app.use(cookieParser());
app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(bodyParser.json());  // this works with jQuery's AJAX toggle on to allow postman requests to work
app.use(bodyParser.urlencoded({  // but when we are using native browser methods, we need this
  extended: true
}));

app.use((req, res, next) => {
  res.locals.helpers = helpers;
  next();
});

app.use((req, res, next) => {
  if(isLoggedIn()) {
    loggedIn = true;
  } else {
    loggedIn = false;
  }
  app.set('loggedIn', loggedIn);  //c038
  next();
});

// view engine set to pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// allow method overrides
app.use(methodOverride('_method'));

// set our paths
app.use('/dist', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/src', express.static(__dirname + '/src'));

// set our endpoints
app.get('/', (req, res) => {
  res.render('landing');
});

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.use('*', (req, res) => {
  return res.status(404).json({
    message: 'Not Found'
  });
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  let promise = new Promise( (resolve, reject) => {
    mongoose.connection.on('open', () => {
      mongoose.connection.db.collection('agenda', (err, collection) => {
        collection.update({ lockedAt: { $exists: true }, lastFinishedAt: { $exists: false } }, {
          $unset: {
            lockedAt: undefined,
            lastModifiedBy: undefined,
            lastRunAt: undefined
          },
          $set: { nextRunAt: new Date() }
        }, { multi: true }, (e, numUnlocked) => {
          if (e) { console.error(e); }
          console.log(`Unlocked #{${numUnlocked}} jobs.`);
        });
      });
    });    
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