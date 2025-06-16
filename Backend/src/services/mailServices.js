const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendVerificationEmail = async (to, username, qrCodeDataUrl, verifyUrl) => {
  const mailOptions = {
    from: `"RunYnov" <${process.env.SMTP_USER}>`,
    to,
    subject: "Vérification de votre adresse email",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px;">
          <h2 style="color: #fdd835;">Bienvenue sur <strong>RunYnov</strong> 👋</h2>
          <p>Bonjour <strong>${username}</strong>,</p>
          <p>Merci de vous être inscrit sur RunYnov !</p>
          <p>Veuillez scanner ce QR code ou cliquer sur le bouton ci-dessous pour valider votre adresse email :</p>
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCodeDataUrl}" alt="QR Code de validation" style="max-width: 200px;" />
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${verifyUrl}" style="background-color: #fdd835; color: #1c1c1c; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">✅ Vérifier mon email</a>
          </div>
          <p style="margin-top: 40px; font-size: 12px; color: #999;">Si vous n'avez pas créé de compte, vous pouvez ignorer ce message.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
