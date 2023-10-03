const crypto = require('crypto');
const User = require('../models/User');
const CustomError = require('../errors');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
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
  // req.get('origin') is tricky when using proxy
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

  if (!(await user.checkPassword(password))) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify you email');
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.json({ msg: 'Logged out!' });
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
};
