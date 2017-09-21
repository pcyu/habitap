exports.DATABASE_URL = process.env.DATABASE_URL ||
global.DATABASE_URL ||
<<<<<<< HEAD
'mongodb://localhost/person';

exports.TEST_DATABASE_URL = (
process.env.TEST_DATABASE_URL ||
'mongodb://localhost/testperson');
=======
'mongodb://localhost/habitap';

// exports.TEST_DATABASE_URL = (
// process.env.TEST_DATABASE_URL ||
// 'mongodb://localhost/testperson');
>>>>>>> 80a5bc95bff6fa4542552f9be22b178e68e88c23

exports.PORT = process.env.PORT || 8080;