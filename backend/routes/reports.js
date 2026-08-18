const express = require("express");
const db = require("../db");
const { auth, audit, parseJson } = require("../middleware");

const router = express.Router();
router.use(auth);

const toReport = (r) => ({
  id: r.id, title: r.title, description: r.description, photo: r.photo, attachment: r.attachment,
  status: r.status, priority: r.priority, project: r.project, task: r.task,
  subtask: r.subtask, subtaskId: r.subtask_id, approvalBy: parseJson(r.approval_by, []), notes: r.notes,
});

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM reports ORDER BY id").all().map(toReport));
});

router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.title) {
    return res.status(400).json({ message: "Judul report wajib diisi" });
  }
  const id = `r${Date.now()}`;
  db.prepare(`
    INSERT INTO reports (id, title, description, photo, attachment, status, priority, project, task, subtask, subtask_id, approval_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.title, b.description || "", b.photo || "-", b.attachment || "-", b.status || "Review",
    b.priority || "Middle", b.project || "-", b.task || "-", b.subtask || null, b.subtaskId || null,
    JSON.stringify(b.approvalBy || []), b.notes || null
  );
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id);
  audit(req.user.name, "Submit Report", `${row.title} disubmit`);
  res.status(201).json(toReport(row));
});

router.put("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Report tidak ditemukan" });
  }
  const b = req.body || {};
  db.prepare(`
    UPDATE reports SET title = ?, description = ?, photo = ?, attachment = ?, status = ?, priority = ?, project = ?, task = ?, subtask = ?, subtask_id = ?, approval_by = ?, notes = ?
    WHERE id = ?
  `).run(
    b.title ?? row.title, b.description ?? row.description, b.photo ?? row.photo, b.attachment ?? row.attachment,
    b.status ?? row.status, b.priority ?? row.priority, b.project ?? row.project, b.task ?? row.task,
    b.subtask ?? row.subtask, b.subtaskId ?? row.subtask_id,
    JSON.stringify(b.approvalBy ?? parseJson(row.approval_by, [])), b.notes ?? row.notes, row.id
  );
  const updated = db.prepare("SELECT * FROM reports WHERE id = ?").get(row.id);
  res.json(toReport(updated));
});

router.delete("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Report tidak ditemukan" });
  }
  db.prepare("DELETE FROM reports WHERE id = ?").run(row.id);
  audit(req.user.name, "Delete Report", `Report ${row.title} dihapus`);
  res.json({ message: "Report dihapus" });
});

module.exports = router;
