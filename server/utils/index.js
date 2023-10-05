const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./createTokenUser');
const checkPermissions = require('./checkPermissions');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const sendVerificationEmail = require('./sendVerificationEmail');
const createHash = require('./createHash');

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
  sendResetPasswordEmail,
  sendVerificationEmail,
  createHash,
};
