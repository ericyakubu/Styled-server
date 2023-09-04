const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  //! Option for Gmail
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //     // Will have to activate "less secure app" option in gmail
  //     //! Best not to use gmail. (only allows 500 emails + chance of being marked as a spammer)
  //     //? Options are: SendGrid & Mailgun
  //   });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: "Eric Yakubu <yakubueric@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
