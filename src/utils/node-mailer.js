const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function nodeMailer(email, otp) {
  console.log("user", process.env.MAIL_USER, process.env.MAIL_PASSWORD);

  try {
    return await transporter.sendMail({
      from: `"VNB Ecommerce" <${process.env.MAIL_USER}>`, // sender address
      to: email,
      subject: "Hello ✔",
      text: "Hello world?",
      html: `<b>${otp}</b>`,
    });
  } catch (error) {
    console.log("Error send email: ", error);
  }
}

module.exports = nodeMailer;
