const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Person} = require('./app/models/habit');
const path = require('path');

// router.get('/heartbeat', (req, res) => {
//   res.json({
//     is: 'working'
//   })
// });

module.exports = function(passport) {

router.get('/habit', function(req, res) {
  res.sendFile(path.join(__dirname+'/src/templates/habit.html'));
});

router.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname+'/src/templates/signup.html'));
});

// router.post('/signup', passport.authenticate('local-signup', {
//   successRedirect : '/habit', // redirect to the secure profile section
//   failureRedirect : '/signup', // redirect back to the signup page if there is an error
//   failureFlash : true // allow flash messages
// }));

router.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname+'/src/templates/login.html'));
});

// router.post('/login', passport.authenticate('local-login', {
//   successRedirect : '/habit', // redirect to the secure profile section
//   failureRedirect : '/login', // redirect back to the signup page if there is an error
//   failureFlash : true // allow flash messages
// }));


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

// /* ===================== FOR TEST =================== */
// router.get('/test', (req, res) => {
//   Person
//     .find()
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

router.get('/persons', (req, res) => {
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

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}
}
module.exports = router;
