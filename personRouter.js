<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Person} = require('./models');

router.use(jsonParser);

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

module.exports = router;
=======
// const express = require('express');
// const router = express.Router();
// const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();
// const {Person} = require('./models');

// router.get('/posts', (req, res) => {
//     Person
//       .find()
//       .exec()
//       .then(persons => {
//         res.json({
//           persons: persons.map( person => person.apiRepr() )
//         });
//       })
//       .catch(err => {
//         console.log(err);
//         return res.status(500).json({message: 'Internal server error'});
//       });
//   });

// module.exports = router;
>>>>>>> 80a5bc95bff6fa4542552f9be22b178e68e88c23
  