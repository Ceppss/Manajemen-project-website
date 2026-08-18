const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signToken } = require("../middleware");

const router = express.Router();

router.post("/login", (req, res) => {
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

module.exports = router;
