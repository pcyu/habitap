require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const jsonParser = bodyParser.json();
const passport = require('passport');
const path = require('path');
const router = express.Router();
const {JWT_SECRET} = require('../config');
const {Person} = require('./model');
const {User} = require('../users/model');


  // router.get('/json', passport.authenticate('jwt', {
  //   session: false}), (req, res) => {
  //   let user = req.user;
  //   let userid = user._id;
  
  //   Person
  //     .find({user_id: userid})
  //     .sort({created: -1})
  //     .exec()
  //     .then(persons => {
  //       res.json(persons.map(person => person.apiRepr()));
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       res.status(500).json({error: 'something went terribly wrong'});
  //     });
  // });
  
router.get('/persons', passport.authenticate('jwt', {
  session: false}), (req, res) => {
  Person
    .find()
    .exec()
    .then(persons => {
      res.json({
        persons: persons.map( person => person.apiRepr() )
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: 'Internal server error'});
    });
});

router.get('/info', passport.authenticate('jwt', {
  session: false}), (req, res) => {
    Person
    .find({ "user_id": req.user.id })
    .exec()
    .then(persons => {
      res.json({
        persons: persons.map( person => person.apiRepr() )
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: 'Internal server error'});
    });
});

function loggedIn(req, res, next) {
  if (req.user) {
      next();
  } else {
      res.redirect('/login');
  }
}

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
  
router.get('/new',  verifyUser, (req, res) => {
  res.render('new', {
    token: req.app.get('loggedIn')
  });
});

router.get('/history', verifyUser, (req, res) => {
  res.render('profile', {
    token: req.app.get('loggedIn')
  });
});
  

  // router.get('/:userid', passport.authenticate('jwt', {
  //   session: false}),(req, res) => {
  //   console.log("hello", req)
  //   User
  //     .findOne({ 'user_id': 'Ghost' })
  //     .exec()
  //     .then( person => {
  //       res.json({
  //         persons: person.apiRepr()
  //       })
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       return res.status(500).json({message: 'Internal server error'});
  //     });
  // });
  
  // router.post('/new', passport.authenticate('jwt', {
  //   session: false}), (req, res) => {
  //     let user = req.user;
  //     // console.log(user, "choke");
  //     const requiredFields = ['question', 'isactive', 'start', 'finish'];
  //   for(let i = 0; i < requiredFields.length; i++) {
  //     const field = requiredFields[i];
  //     if(!(field in req.body)) {
  //       const message = `The value for \`${field}\` is missing.`
  //       console.error(message);
  //       return res.status(400).send(message);
  //     }
  //   }
  //   Person
  //     .create({
  //       question: req.body.question,
  //       isactive: req.body.isactive,
  //       start: {
  //         month: req.body.start.month,
  //         day: req.body.start.day,
  //         year: req.body.start.year
  //       },
  //       finish: {
  //         month: req.body.finish.month,
  //         day: req.body.finish.day,
  //         year: req.body.finish.year
  //       },
  //       user_id: user.id
  //     })
  //     .then(
  //       habitEntry => res.status(201).json(habitEntry.apiRepr())
  //     )
  //     .catch(err => {
  //       console.error(err);
  //       return res.status(500).json({message: 'Internal server error'});
  //     });
  // });

router.post('/new', passport.authenticate('jwt', {
  session: false}), (req, res) => {
    let user = req.user;
    // console.log(user, "choke");
    const requiredFields = ['question'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `The value for \`${field}\` is missing.`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Person
    .create({
      question: req.body.question,
    })
    .then(
      habitEntry => res.status(201).json(habitEntry.apiRepr())
    )
    .catch(err => {
      console.error(err);
      return res.status(500).json({message: 'Internal server error'});
    });
});
  
router.put('/:id/', (req, res) => {  //p002
  if(req.params.id !== req.body.id) {
    const message = `The request path (${req.params.id}) and the request body id (${req.body.id}) must match.`;
    console.error(message);
    return res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['question', 'isactive', 'start', 'finish'];;
  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  Person
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then( person => res.json(204).end() )
    .catch(err => {
      console.error(err);
      return res.status(500).json({message: 'Internal server error'})
    });
});
  
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
  
module.exports = {router};