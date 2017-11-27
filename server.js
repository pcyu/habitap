require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const express = require('express');
const helpers = require('./helpers');
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

// set our paths
app.use('/dist', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/src', express.static(__dirname + '/src'));

// set our endpoints
app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/register', (req, res) => {
  res.render('register');
});

const verifyUser = (req, res, next) => {
	try {
		const token = req.headers.authorization || req.cookies.token;
		// const token = req.cookies.auth;
		const {user} = jwt.verify(token, JWT_SECRET);
		req.user = user;
		req.validUser = req.params.username === user.username ? true : false;
		console.log('yeaaaaaa!');
		next();
	} catch (e) {
		console.log('error!');
		next();
	}
  };

app.get('/users/history', verifyUser, (req, res) => {
  User
	.findOne({ "username": req.user.username})
	.exec()
	.then( user => {
    console.log(user.habits[0].question, "single question")
      for (let i = 0; i < user.habits.length; i++) {
        console.log(user.habits[i].question, "each question is output")
      }
    res.render('history', {
      firstName: user.firstName,
      id: user.id,
      habits: user.habits,
      token: req.app.get('loggedIn')
  });
  });
});

app.get('/users/new', verifyUser, (req, res) => {
  res.render('new', {
    token: req.app.get('loggedIn')
  });
});

// app.get('/habits/:userid', passport.authenticate('jwt', {
//   session: false}),(req, res) => {
//   User
//   //write code that checks if the cookie matches the token
//     .findOne({ "username": req.params.username}).exec().then( user => {
//       console.log(user._id, "users")
//       if (user.id !== req.user.id) {
//         res.render('landing')
//       }
//       res.render('profile', {
//         name: user.firstName
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       return res.status(500).json({message: 'Internal server error'});
//     });
// });

app.use('/auth', authRouter);
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