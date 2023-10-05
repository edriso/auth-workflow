const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const CustomError = require('../errors');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require('../utils');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new CustomError.BadRequestError('Email already in use');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  // we could get FRONTEND_BASE_URL from req
  // const forwardedProtocol = req.get('x-forwarded-proto'); // eg., http | https
  // const forwardedHost = req.get('x-forwarded-host'); // eg., localhost:3000
  //// req.get('origin') is tricky when using proxy
  // req.get('host) // localhost:5000
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
  });

  res.status(201).json({
    msg: 'Success! Please check your email to verify account',
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  if (!verificationToken || !email) {
    throw new CustomError.BadRequestError(
      'Missing email or verification token',
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError('User not found');
  }
  if (user.isVerified) {
    throw new CustomError.ConflictError('User is already verified');
  }
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  user.isVerified = true;
  user.verifiedAt = Date.now();
  user.verificationToken = undefined;
  await user.save();

  res.json({ msg: 'Email verified successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError('Missing Email or password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const isPasswordCorrect = await user.checkPassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify you email');
  }

  const tokenUser = createTokenUser(user);

  let refreshToken = '';

  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid credentials');
    }

    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  // two ways to access something from the headers:
  // req.headers['something'] || req.get('something')
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  };
  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  res.json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({
    user: req.user.userId,
  });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(204).json({ msg: 'Logged out!' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');

    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
    });

    const tenMinutes = 1000 * 60 * 10; // in milliseconds
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  // we send that msg anyway incase the user exists or not, to make our app more secure
  // attackers may know what emails I have in my db, if we didn't do it that way
  res.json({ msg: 'Please check your email for reset password link' });
};

const resetPassword = async (req, res) => {
  res.json('resetPassword');
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
