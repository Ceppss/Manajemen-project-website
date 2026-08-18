const express = require("express");
const db = require("../db");
const { auth, audit } = require("../middleware");

const router = express.Router();
router.use(auth);

const toDaily = (r) => ({
  id: r.id, title: r.title, description: r.description, photo: r.photo, attachment: r.attachment,
  status: r.status, date: r.date, activity: r.activity, gps: r.gps ? JSON.parse(r.gps) : null,
});

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM daily_reports ORDER BY date DESC, id").all().map(toDaily));
});

router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.title) {
    return res.status(400).json({ message: "Judul report wajib diisi" });
  }
  const id = `dr${Date.now()}`;
  db.prepare(`
    INSERT INTO daily_reports (id, title, description, photo, attachment, status, date, activity, gps)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.title, b.description || "", b.photo || "-", b.attachment || "-", b.status || "Review",
    b.date || new Date().toISOString().slice(0, 10), b.activity || b.title,
    b.gps ? JSON.stringify(b.gps) : null
  );
  const row = db.prepare("SELECT * FROM daily_reports WHERE id = ?").get(id);
  audit(req.user.name, "Submit Report", `${row.title} (daily report)`);
  res.status(201).json(toDaily(row));
});

router.put("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM daily_reports WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Report tidak ditemukan" });
  }
  const b = req.body || {};
  db.prepare(`
    UPDATE daily_reports SET title = ?, description = ?, photo = ?, attachment = ?, status = ?, date = ?, activity = ?, gps = ?
    WHERE id = ?
  `).run(
    b.title ?? row.title, b.description ?? row.description, b.photo ?? row.photo, b.attachment ?? row.attachment,
    b.status ?? row.status, b.date ?? row.date, b.activity ?? row.activity,
    b.gps ? JSON.stringify(b.gps) : row.gps, row.id
  );
  const updated = db.prepare("SELECT * FROM daily_reports WHERE id = ?").get(row.id);
  res.json(toDaily(updated));
});

router.delete("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM daily_reports WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Report tidak ditemukan" });
  }
  db.prepare("DELETE FROM daily_reports WHERE id = ?").run(row.id);
  audit(req.user.name, "Delete Report", `Daily report ${row.title} dihapus`);
  res.json({ message: "Report dihapus" });
});

module.exports = router;
