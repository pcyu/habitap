const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config/database');
const personRouter = require('./personRouter');

const app = express();

app.use( '/', express.static(__dirname + '/public') );
app.use( '/node_modules', express.static(__dirname + '/node_modules') );
app.use( '/src', express.static(__dirname + '/src') );
app.use('/persons', personRouter);
app.use(bodyParser);
app.use(cookieParser);
app.use(morgan);
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
  
let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  let promise = new Promise( (resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if(err) {
        return reject(err);
      }
      require('./config/passport')(passport); // pass passport for configuration
      require('./app/userRouter.js')(app, passport); // load our routes and pass in our app and fully configured passport
      
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
