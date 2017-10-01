var chai = require('chai');
var chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

var should = chai.should();

const {Person} = require('../models');
const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);

function seedUserData() {
  console.info('seeding user entry data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateUserData());
  }
  // this will return a promise
  return {Person}.insertMany(seedData);
}

// function generateDreamType() {
//   let type = ['Normal Dream', 'Lucid Dream', 'Nightmare', 'Daydream', 'False Awakening'];
//   return type[Math.floor(Math.random() * type.length)];
// }

// function generateHoursSlept() {
//   return Math.floor(Math.random() * 10);
// }

// // generate an object represnting a dream.
// // can be used to generate seed data for db
// // or request.body data
// function generateDreamData() {
//   return {
//     title: faker.lorem.sentence(),
//     entry: faker.lorem.paragraph(),
//     type: generateDreamType(),
//     hoursSlept: generateHoursSlept()
//   }
// }

// function generateUser() {
//   return {
//     firstName: faker.name.firstName(),
//     lastName: faker.name.lastName(),
//     username: faker.random.word(),
//     password: faker.random.alphaNumeric()
//   }
// }

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  data from one test does not stick
// around for next one
//
// we have this function return a promise because
// mongoose operations are asynchronous. we can either
// call a `done` callback or return a promise in our
// `before`, `beforeEach` etc. functions.
// https://mochajs.org/#asynchronous-hooks
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('Habitap API resource', function() {
  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer();
  });

  beforeEach(function() {
    return seedUserData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });
});

describe('index page', function() {
  it('exists', function(done) {
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;
        done();
    });
  });
});

describe('GET endpoint', function() {
  
      it('should return all existing people', function() {
        // strategy:
        //    1. get back all guns returned by by GET request to `/guns`
        //    2. prove res has right status, data type
        //    3. prove the number of guns we got back is equal to number
        //       in db.
        //
        // need to have access to mutate and access `res` across
        // `.then()` calls below, so declare it here so can modify in place
        let res;
        return chai.request(app)
          .get('/persons')
          .then(function(_res) {
            // so subsequent .then blocks can access resp obj.
            res = _res;
            res.should.have.status(200);
            // otherwise our db seeding didn't work
            return Person.count();
            done();
          })
      });
  });