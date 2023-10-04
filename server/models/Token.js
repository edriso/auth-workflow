const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    // userAgent refers to the device accessing the resources
    userAgent: {
      type: String,
      required: true,
    },
    // We can prevent user from log in if we set isValid to be false, as we check about that in the log in
    isValid: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
