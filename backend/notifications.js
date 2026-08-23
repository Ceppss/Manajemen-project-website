const db = require("./db");
const { sendMail } = require("./mailer");

function notify(userId, title, description, link) {
  if (!userId) return;
  db.prepare("INSERT INTO notifications (user_id, title, description, link) VALUES (?, ?, ?, ?)")
    .run(userId, title, description || "", link || null);

  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId);
  if (user?.email) {
    sendMail(user.email, title, description || title);
  }
}

module.exports = { notify };
