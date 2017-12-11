const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
      required: true,
      default: '',
      type: String
    },
    habits: [
      {
        habitId: String,
        question: String,
        startDate: { type : Date, default: Date.now },
        dailyCheck: [
          { _id: false,
            answer: String,
            time: { type : Date, default: Date.now }
          }
        ]
      }
    ],
    lastName: {
      required: true,
      default: '',
      type: String
    },
    password: {
      required: true,
      type: String
    },
    username: {
      required: true,
      type: String,
      unique: true
    }
});

userSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        username: this.username || '',
        habits: this.habits || '',
        firstName: this.firstName || '',
        lastName: this.lastName || ''
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
