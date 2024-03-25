const nodemailer = require('nodemailer');

const sendEmail = async options => { 
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'chauncey.kessler@ethereal.email',
        pass: 'qfNygK1W2NeMRhZx9D'
    }
});
  

  // 2) Define the email options
  const mailOptions = {
    from: 'Anikit <chakrabortyanikit115@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
