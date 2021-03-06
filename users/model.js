const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    habits: [
      { _id: false,
        active: Boolean,
        dailyCheck: [
          { 
            _id: false,
            points: Number,
            date: String
          }
        ],
        habitId: String,
        question: String,
        questionArray: [ 
          { 
            _id: false,
            question: String,
            revisionDate: String,
          } 
        ],
        score: Number,
        todayAnswer: Boolean,
      }
    ],
    password: {
      required: true,
      type: String
    },
    username: {
      required: true,
      type: String,
      unique: true
    },
    elo: Number,
});

userSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        username: this.username || '',
        habits: this.habits || '',
        elo: this.elo || ''
    };
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = {User};
