const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const habitSchema = mongoose.Schema({
  name: {type: String, required: true},
  habit: [{
    id: String,
    title: String,
    summary: String,
    isActive: Boolean,
    startDate: Date,
    endDate: Date,
    publishedAt: Date,
  }]
});

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the address object
// we're storing in Mongo.

// this virtual grabs the most recent grade for a restaurant.

// habitSchema.virtual('habits').get(function() {
//   const habitObj = this.habit.sort((a, b) => {return b.date - a.date})[0] || {};
//   return habitObj.habit;
// });

// // this is an *instance method* which will be available on all instances
// // of the model. This method will be used to return an object that only
// // exposes *some* of the fields we want from the underlying data
// habitSchema.methods.apiRepr = function() {

//   return {
//     id: this._id,
//     name: this.name,
//     cuisine: this.cuisine,
//     borough: this.borough,
//     grade: this.grade,
//     address: this.addressString
//   };
// }

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const Habit = mongoose.model('Habit', habitSchema);

module.exports = {Habit};
