exports.DATABASE_URL = process.env.DATABASE_URL ||
global.DATABASE_URL ||
'mongodb://localhost/habitap';
// "mongodb://admin:admin@ds163294.mlab.com:63294/habitap";

exports.PORT = process.env.PORT || 3007;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';