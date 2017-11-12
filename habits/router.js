const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Person} = require('./model');
const path = require('path');
const passport = require('passport');

// router.get('/persons', passport.authenticate('jwt', {
//   session: false}), (req, res) => {

  router.get('/json', passport.authenticate('jwt', {
    session: false}), (req, res) => {
    let user = req.user;
    let userid = user._id;
  
    Person
      .find({user_id: userid})
      .sort({created: -1})
      .exec()
      .then(persons => {
        res.json(persons.map(person => person.apiRepr()));
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({error: 'something went terribly wrong'});
      });
  });
  
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
  
  // router.get('/history', (req, res) => {
  //   let user = req.user;
  //   let userid = user._id
  //   res.sendFile(__dirname+'/src/templates/habit-history.html');
  // });
  
  // router.get('/new', (req, res) => {
  //   let user = req.user;
  //   let userid = user._id
  //   res.sendFile(__dirname+'/src/templates/habit-form.html');
  // });
  
  router.get('/:id', (req, res) => {
    Person
      .findById(req.params.id)
      .exec()
      .then( person => {
        res.json({
          persons: person.apiRepr()
        })
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({message: 'Internal server error'});
      });
  });
  
  router.post('/new', passport.authenticate('jwt', {
    session: false}), (req, res) => {
      let user = req.user;
      // console.log(user, "choke");
      const requiredFields = ['question', 'isactive', 'start', 'finish'];
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
        isactive: req.body.isactive,
        start: {
          month: req.body.start.month,
          day: req.body.start.day,
          year: req.body.start.year
        },
        finish: {
          month: req.body.finish.month,
          day: req.body.finish.day,
          year: req.body.finish.year
        },
        user_id: user.id
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