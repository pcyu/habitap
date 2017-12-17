const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
      required: true,
      default: '',
      type: String
    },
    habits: [
      { _id: false,
        active: Boolean,
        dailyCheck: [ Number ],
        endDate: String,
        habitId: String,
        question: String,
        startDate: String,
        todayAnswer: Boolean,
        timeStamp: {
          default: Date.now,
          type : Date
        }
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
