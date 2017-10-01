const mongoose = require('mongoose');

const personSchema = mongoose.Schema({
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

const Person = mongoose.model('Person', personSchema);

module.exports = {Person};
