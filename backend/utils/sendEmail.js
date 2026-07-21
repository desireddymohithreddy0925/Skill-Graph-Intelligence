const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP is provided in .env, use it. Otherwise, use a fake Ethereal account for testing.
  let transporter;

  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail', // Or configure host/port for your specific provider
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const mailOptions = {
    from: '"Skill Graph Intelligence" <noreply@skillgraph.app>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!process.env.SMTP_EMAIL) {
    console.log("=========================================");
    console.log("Fake Email Sent! View it here: %s", nodemailer.getTestMessageUrl(info));
    console.log("=========================================");
  }
};

module.exports = sendEmail;
