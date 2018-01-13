const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');
const {User} = require('../users/model');
const {JWT_SECRET} = require('../config');

const localStrategy = new LocalStrategy((username, password, callback) => {
let user;
User.findOne({username: username})
  .then(_user => {
      user = _user;
      if (!user) {
          // Return a rejected promise so we break out of the chain of .thens.
          // Any errors like this will be handled in the catch block.
          return Promise.reject({
              //c037
              reason: 'LoginError',
              message: 'Incorrect username or password'
          });
      }
      return user.validatePassword(password);
  })
  .then(isValid => {
      if (!isValid) {
          return Promise.reject({
              reason: 'LoginError',
              message: 'Incorrect username or password'
          });
      }
      return callback(null, user);
  })
  .catch(err => {
    console.log(err, "err")
      if (err.reason === 'LoginError') {
          return callback(null, false, err);
      }
      return callback(err, false);
  });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: function(req) {
        console.log(req, "jwtreq.user")
      var token = null;
      if (req && req.cookies)
      {
        token = req.cookies['token'];
      }
      console.log(token, "token")
      return token;
    },
    // Only allow HS256 tokens - the same as the ones we issue
    algorithms: ['HS256']
  },
  (payload, done) => {
      done(null, payload.user);
  }
);

module.exports = {localStrategy, jwtStrategy};
