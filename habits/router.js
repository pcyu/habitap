const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Person} = require('./model');
const path = require('path');
const passport = require('passport');

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+'/templates/habits.html'));
});

router.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname+'/templates/signup.html'));
});

router.delete('/:id', (req, res) => {
  Person
    .findByIdAndRemove(req.params.id, function(err, value) {
      if(err) {
        const message = `It appears that the document with id (${req.params.id}) does not exist.`;
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .exec()
    .then( person => {
      const message = `204 / The document with id ${req.params.id} has been deleted`;
      console.log(message);
      return res.json(message).end();
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: 'Internal server error'});
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

router.get('/persons/:id', (req, res) => {
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

router.post('/persons', (req, res) => {
  const requiredFields = ['name', 'habits'];
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
      name: req.body.name,
      habits: req.body.habits,
    })
    .then(
      person => res.status(201).json(person.apiRepr())
    )
    .catch(err => {
      console.error(err);
      return res.status(500).json({message: 'Internal server error'});
    });
});

router.put('/persons/:id', (req, res) => {  //p002
  if(req.params.id !== req.body.id) {
    const message = `The request path (${req.params.id}) and the request body id (${req.body.id}) must match.`;
    console.error(message);
    return res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['name', 'habits', 'id'];
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