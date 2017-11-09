const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
      default: '',
      type: String
    },
    habits: [
      {
        endDate: String,
        id: String,
        isactive: Boolean,
        publishedAt: Number,
        startDate: String,
        title: String
      }
    ],
    lastName: {
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
        username: this.username || '',
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
