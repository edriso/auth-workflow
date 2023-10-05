const jwt = require('jsonwebtoken');

const createJWT = ({ payload }) => {
  // expiresIn was removed as we'll control the token through refreshToken cookie
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    maxAge: 1000 * 60 * 15, // Cookie will expire after 15 min
  });

  const expiresIn30Days = 1000 * 60 * 60 * 24 * 30;
  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + expiresIn30Days),
  });
};

// const attachSingleCookieToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });
//   const oneDay = 1000 * 60 * 60 * 24;
//   res.cookie('token', token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay), // 1 day to match the token expiration
//     secure: process.env.NODE_ENV === 'production', // if true, send the cookie with https only
//     signed: true, // if true, it makes the cookie signed, it can detect if client modified the cookie
//   });
// };

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
