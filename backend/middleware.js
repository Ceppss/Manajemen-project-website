const jwt = require("jsonwebtoken");
const db = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "meditrans-dev-secret";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: `Hanya ${role} yang bisa melakukan aksi ini` });
    }
    next();
  };
}

function audit(actor, action, detail) {
  db.prepare("INSERT INTO audit_logs (actor, action, detail) VALUES (?, ?, ?)").run(actor, action, detail);
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

module.exports = { signToken, auth, requireRole, audit, parseJson };
