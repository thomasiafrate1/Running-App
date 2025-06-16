const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const mailOptions = {
  from: process.env.SMTP_USER,
  to: "runynov@gmail.com", // mets une vraie adresse ici
  subject: "Test Email",
  text: "Ceci est un test d'envoi via Nodemailer",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log("❌ Erreur :", error);
  }
  console.log("✅ Email envoyé :", info.response);
});
