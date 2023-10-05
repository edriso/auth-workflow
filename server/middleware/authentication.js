const Token = require('../models/Token');
const CustomError = require('../errors');
const { isTokenValid, attachCookiesToResponse } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }

    const payload = isTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Invalid authentication');
    }

    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Invalid authentication');
  }
};

const authorizePermissions = (...authorizedRoles) => {
  // when adding authorizePermissions middleware, we write it like this authorizePermissions('admin', 'owner')
  // but this call the function immediately
  // that's why we must return a function to reference to it
  return (req, res, next) => {
    if (!authorizedRoles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route',
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
