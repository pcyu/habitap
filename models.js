// const mongoose = require('mongoose');

// const personSchema = mongoose.Schema({
//   name: {type: String},  // e.g. account, personal, or tax
//   active: {type: Boolean},
//   age: {type: Number}
// });

// personSchema.methods.apiRepr = function() {
//   return {
//     id: this._id,
//     name: this.name,
//     active: this.active,
//     age: this.age
//   };
// }

// const Person = mongoose.model('Persons', personSchema);

// module.exports = {Person};

const mongoose = require('mongoose');

const personSchema = mongoose.Schema({
  id: String,
  name: String,
  habits: [
    {
      id: String,
      title: String,
      isactive: Boolean,
      startDate: String,
      endDate: String,
      publishedAt: Number,
    }
  ]
});

personSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.name,
    habits: this.habits
  };
}

const Person = mongoose.model('Persons', personSchema);

module.exports = {Person};
