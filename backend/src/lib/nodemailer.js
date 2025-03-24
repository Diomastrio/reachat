import nodemailer from "nodemailer";

let transporter;

// Use the same email configuration for both environments
transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ReaChat" <reset@reachat.com>',
    to: email,
    subject: "Restablecimiento de contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Restablecimiento de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para crear una nueva contraseña:</p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Restablecer Contraseña</a>
        </div>
        <p>Si no solicitaste este cambio, puedes ignorar este correo electrónico.</p>
        <p>Este enlace es válido por 1 hora.</p>
        <p>Saludos,<br>El Equipo de ReaChat</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
