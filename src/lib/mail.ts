import nodemailer from "nodemailer";
export async function sendMail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) { console.log("[MAIL not configured]\nTo: " + to + "\n" + subject + "\n" + text); return; }
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await t.sendMail({ from: process.env.MAIL_FROM || "no-reply@localhost", to, subject, text });
}