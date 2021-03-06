const mongoose = require('mongoose');
const crypto = require('crypto');
const uuid = require('uuid');
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    middle_name: {
      type: String,
      required: false,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    userinfo: {
      type: String,
      trim: true,
    },
    encry_password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
    role: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = uuid.v4();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },
  securePassword: function (plainpassword) {
    if (!plainpassword) {
      return '';
    }
    try {
      return crypto
        .createHmac('sha256', this.salt)
        .update(plainpassword)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
};
module.exports = mongoose.model('User', userSchema);
