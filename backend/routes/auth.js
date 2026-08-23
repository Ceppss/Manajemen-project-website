const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const { signToken, auth, audit } = require("../middleware");

const router = express.Router();

// Brute-force guard: 10 attempts per 15 min per IP, regardless of outcome.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Terlalu banyak percobaan login, coba lagi nanti." },
});

router.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get((email || "").trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).json({ message: "Email atau password salah" });
  }
  res.json({
    token: signToken(user),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

router.put("/profile", auth, (req, res) => {
  const { name, currentPassword, newPassword } = req.body || {};
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!row) {
    return res.status(404).json({ message: "Akun tidak ditemukan" });
  }
  if (newPassword) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword || "", row.password_hash)) {
      return res.status(400).json({ message: "Password saat ini salah" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password baru minimal 8 karakter" });
    }
  }
  const newName = (name || "").trim() || row.name;
  const hash = newPassword ? bcrypt.hashSync(newPassword, 10) : row.password_hash;
  db.prepare("UPDATE users SET name = ?, password_hash = ? WHERE id = ?").run(newName, hash, row.id);
  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(row.id);
  audit(updated.name, "Edit Profile", `${updated.name} memperbarui profil${newPassword ? " dan password" : ""}`);
  const user = { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
  res.json({ token: signToken(updated), user });
});

module.exports = router;
