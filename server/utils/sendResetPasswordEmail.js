const sendEmail = require('./sendEmail');

const sendResetPasswordEmail = async ({ name, email, token }) => {
  const resetPasswordURL = `${process.env.FRONTEND_BASE_URL}/user/reset-password?token=${token}&email=${email}`;

  const message = `<p>Click the following link to reset your password within 10 minutes:
  <a href="${resetPasswordURL}">Reset Password</a>.</p>`;

  return sendEmail({
    to: email,
    subject: 'Password Reset',
    html: `<h4>It's OK to forget your password, ${name} :)</h4>
    ${message}`,
  });
};

module.exports = sendResetPasswordEmail;
