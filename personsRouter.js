//    console.log(message);
// //       return res.json(message).end();
// //     })
// //     .catch(err => {
// //       console.log(err);
// //       return res.status(500).json({message: 'Internal server error'});
// //     });
// // });

// // router.get('/', (req, res) => {
// //   Person
// //     .find()
// //     .exec()
// //     .then(persons => {
// //       res.json({
// //         persons: persons.map( person => person.apiRepr() )
// //       });
// //     })
// //     .catch(err => {
// //       console.log(err);
// //       return res.status(500).json({message: 'Internal server error'});
// //     });
// // });

// // router.get('/:id', (req, res) => {
// //   Person
// //     .findById(req.params.id)
// //     .exec()
// //     .then( person => {
// //       res.json({
// //         persons: person.apiRepr()
// //       })
// //     })
// //     .catch(err => {
// //       console.log(err);
// //       return res.status(500).json({message: 'Internal server error'});
// //     });
// // });

// // router.post('/', (req, res) => {
// //   const requiredFields = ['dIsType', 'longName', 'shortName'];
// //   for(let i = 0; i < requiredFields.length; i++) {
// //     const field = requiredFields[i];
// //     if(!(field in req.body)) {
// //       const message = `The value for \`${field}\` is missing.`
// //       console.error(message);
// //       return res.status(400).send(message);
// //     }
// //   }
// //   Person
// //     .create({
// //       dIsType: req.body.dIsType,
// //       shortName: req.body.shortName,
// //       longName: req.body.longName,
// //       moreInfo: req.body.moreInfo
// //     })
// //     .then(
// //       person => res.status(201).json(person.apiRepr())
// //     )
// //     .catch(err => {
// //       console.error(err);
// //       return res.status(500).json({message: 'Internal server error'});
// //     });
// // });

// // router.put('/:id', (req, res) => {  //p002
// //   if(req.params.id !== req.body.id) {
// //     const message = `The request path (${req.params.id}) and the request body id (${req.body.id}) must match.`;
// //     console.error(message);
// //     return res.status(400).json({message: message});
// //   }
// //   const toUpdate = {};
// //   const updateableFields = ['name', 'active', 'age'];
// //   updateableFields.forEach(field => {
// //     if(field in req.body) {
// //       toUpdate[field] = req.body[field];
// //     }
// //   });
// //   Person
// //     .findByIdAndUpdate(req.params.id, {$set: toUpdate})
// //     .exec()
// //     .then( person => res.json(204).end() )
// //     .catch(err => {
// //       console.error(err);
// //       return res.status(500).json({message: 'Internal server error'})
// //     });
// // });

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();
// const {Person} = require('./models');

// router.delete('/:id', (req, res) => {
//   Person
//     .findByIdAndRemove(req.params.id, function(err, value) {
//       if(err) {
//         const message = `It appears that the document with id (${req.params.id}) does not exist.`;
//         console.error(message);
//         return res.status(400).send(message);
//       }
//     })
//     .exec()
//     .then( person => {
//       const message = `204 / The document with id ${req.params.id} has been deleted`;
// //    