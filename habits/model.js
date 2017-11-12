const mongoose = require('mongoose');

const personSchema = mongoose.Schema({
  question: {type: String, required: true},
  isactive: Boolean,
  start: {
    month: Number,
    day: Number,
    year: Number
  },
  //c038
  finish: {
    month: Number,
    day: Number,
    year: Number
  },
  user_id: String
});

//c039
personSchema.virtual('startDate').get(function() {
  if ((`${this.start.day}` <= 9) && (`${this.start.month}` <= 9)) {
    return `0${this.start.month}.0${this.start.day}.${this.start.year}`.trim();
  }
  else if ((`${this.start.day}` <= 9) && (`${this.start.month}` > 9)) {
    return `${this.start.month}.0${this.start.day}.${this.start.year}`.trim();
  }
  else if ((`${this.start.month}` <= 9) && (`${this.start.day}` > 9)) {
    return `0${this.start.month}.${this.start.day}.${this.start.year}`.trim();
  }
  else {
    return `${this.start.month}.${this.start.day}.${this.start.year}`.trim();
  }
});

personSchema.virtual('finishDate').get(function() {
  if ((`${this.finish.day}` <= 9) && (`${this.finish.month}` <= 9)) {
    return `0${this.finish.month}.0${this.finish.day}.${this.finish.year}`.trim();
  }
  else if ((`${this.finish.day}` <= 9) && (`${this.finish.month}` > 9)) {
    return `${this.finish.month}.0${this.finish.day}.${this.finish.year}`.trim();
  }
  else if ((`${this.finish.month}` <= 9) && (`${this.finish.day}` > 9)) {
    return `0${this.finish.month}.${this.finish.day}.${this.finish.year}`.trim();
  }
  else {
    return `${this.finish.month}.${this.finish.day}.${this.finish.year}`.trim();
  }
});

personSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    question: this.question,
    isactive: this.isactive,
    start: this.startDate,
    finish: this.finishDate,
    user_id: this.user_id
  };
}

const Person = mongoose.model('Persons', personSchema);

module.exports = {Person};