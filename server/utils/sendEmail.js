const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    from: '"Fred Boo 👻" <boo@example.com>',
    to,
    subject,
    html,
  };

  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail(msg); // returns a promise
};

module.exports = sendEmail;
