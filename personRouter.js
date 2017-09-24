const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Person} = require('./models');

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

router.get('/', (req, res) => {
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

router.post('/', (req, res) => {
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

router.put('/:id', jsonParser, (req, res) => {  //p002
  const requiredFields = ['name', 'habits', 'id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating habits \`${req.params.id}\``);

  Person.update({
    name: req.body.name,
    habits: req.body.habits,
    id: req.params.id
  });

  res.status(204).end();
});

module.exports = router;
