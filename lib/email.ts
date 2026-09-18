import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailOptions) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Festival Folk Austral",
    to,
    subject,
    html,
    attachments,
  });
  return info;
}
