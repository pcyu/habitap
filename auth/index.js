const {router} = require('./router');
// const {basicStrategy, jwtStrategy} = require('./strategies');
const {basicStrategy, localStrategy, jwtStrategy} = require('./strategies');

// module.exports = {router, basicStrategy, jwtStrategy};
module.exports = {router, basicStrategy, localStrategy, jwtStrategy};
