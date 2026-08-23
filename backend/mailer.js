const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
const configured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = configured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

if (!configured) {
  console.warn("[mailer] SMTP belum dikonfigurasi (lihat backend/.env.example) - notifikasi email akan dilewati.");
}

async function sendMail(to, subject, text) {
  if (!transporter) return;
  try {
    await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, to, subject, text });
  } catch (err) {
    console.error(`[mailer] Gagal kirim email ke ${to}: ${err.message}`);
  }
}

module.exports = { sendMail };
