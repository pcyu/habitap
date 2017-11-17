const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// Assigns the Strategy export to the name JwtStrategy using object
// destructuring
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assigning_to_new_variable_names
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
        var token = null;
        if (req && req.cookies)
        {
          token = req.cookies['token'];
        }
        return token;
    },
    // Only allow HS256 tokens - the same as the ones we issue
    algorithms: ['HS256']
  },
  (payload, done) => {
    console.log('Payload', payload);
      done(null, payload.user);
  }
);

module.exports = {localStrategy, jwtStrategy};