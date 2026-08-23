const express = require("express");
const db = require("../db");
const { auth } = require("../middleware");

const router = express.Router();
router.use(auth);

const toNotification = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  link: r.link,
  unread: !r.is_read,
  createdAt: r.created_at,
});

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50")
    .all(req.user.id);
  res.json(rows.map(toNotification));
});

router.put("/:id/read", (req, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ message: "ok" });
});

router.put("/read-all", (req, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id);
  res.json({ message: "ok" });
});

module.exports = router;
