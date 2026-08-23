const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { auth, requireRole, audit } = require("../middleware");

const router = express.Router();
router.use(auth);

function publicUser(row) {
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT id, email, name, role FROM users ORDER BY name").all();
  res.json(rows);
});

router.post("/", requireRole("Superadmin"), (req, res) => {
  const { password, name, email, role } = req.body || {};
  if (!password || !name || !email || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail)) {
    return res.status(409).json({ message: "Email sudah dipakai" });
  }
  const info = db
    .prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)")
    .run(normalizedEmail, bcrypt.hashSync(password, 10), name.trim(), role);
  const row = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(info.lastInsertRowid);
  audit(req.user.name, "Add Employee", `${row.name} ditambahkan sebagai ${row.role}`);
  res.status(201).json(publicUser(row));
});

router.put("/:id", requireRole("Superadmin"), (req, res) => {
  const { password, name, email, role } = req.body || {};
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(req.params.id));
  if (!row) {
    return res.status(404).json({ message: "Akun tidak ditemukan" });
  }
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(normalizedEmail, row.id)) {
    return res.status(409).json({ message: "Email sudah dipakai" });
  }
  const hash = password ? bcrypt.hashSync(password, 10) : row.password_hash;
  db.prepare("UPDATE users SET email = ?, password_hash = ?, name = ?, role = ? WHERE id = ?")
    .run(normalizedEmail, hash, (name || "").trim(), role, row.id);
  const updated = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(row.id);
  audit(req.user.name, "Edit Employee", `${updated.name} diperbarui (role: ${updated.role})`);
  res.json(publicUser(updated));
});

router.delete("/:id", requireRole("Superadmin"), (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(req.params.id));
  if (!row) {
    return res.status(404).json({ message: "Akun tidak ditemukan" });
  }
  if (row.id === req.user.id) {
    return res.status(400).json({ message: "Tidak bisa menghapus akun sendiri" });
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(row.id);
  audit(req.user.name, "Delete Employee", `Akun ${row.name} (${row.email}) dihapus`);
  res.json({ message: "Akun dihapus" });
});

module.exports = router;
