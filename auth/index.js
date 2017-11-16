const {router, isLoggedIn} = require('./router');
const {localStrategy, jwtStrategy} = require('./strategies');
module.exports = {router, localStrategy, jwtStrategy, isLoggedIn};
