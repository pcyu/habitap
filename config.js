exports.DATABASE_URL = 
// process.env.DATABASE_URL ||
// global.DATABASE_URL ||
'mongodb://localhost/habitap';

exports.PORT = process.env.PORT || 3007;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';