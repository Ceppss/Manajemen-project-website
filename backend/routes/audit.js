const express = require("express");
const db = require("../db");
const { auth, audit } = require("../middleware");

const router = express.Router();
router.use(auth);

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT id, actor, action, detail, created_at FROM audit_logs ORDER BY id DESC LIMIT 200")
    .all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const { action, detail } = req.body || {};
  if (!action || !detail) {
    return res.status(400).json({ message: "action dan detail wajib diisi" });
  }
  audit(req.user.name, action, detail);
  res.status(201).json({ message: "Audit tercatat" });
});

module.exports = router;
