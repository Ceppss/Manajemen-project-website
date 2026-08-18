const express = require("express");
const db = require("../db");
const { auth, audit, parseJson } = require("../middleware");

const router = express.Router();
router.use(auth);

const toTask = (r) => ({
  id: r.id, title: r.title, description: r.description, priority: r.priority, status: r.status,
  assignees: parseJson(r.assignees, []), dueInDays: r.due_in_days, dueColor: r.due_color,
  startDate: r.start_date, endDate: r.end_date, projectId: r.project_id, type: r.type,
  subtasks: parseJson(r.subtasks, []),
});

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM tasks ORDER BY id").all().map(toTask));
});

router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.title) {
    return res.status(400).json({ message: "Judul task wajib diisi" });
  }
  const id = `t${Date.now()}`;
  db.prepare(`
    INSERT INTO tasks (id, title, description, priority, status, assignees, due_in_days, due_color, start_date, end_date, project_id, type, subtasks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.title, b.description || "", b.priority || "Middle", b.status || "Not Started",
    JSON.stringify(b.assignees || []), b.dueInDays || 0, b.dueColor || "ongoing",
    b.startDate || "", b.endDate || "", b.projectId || null, b.type || "project",
    JSON.stringify(b.subtasks || [])
  );
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  audit(req.user.name, "Add Task", `${row.title} ditambahkan`);
  res.status(201).json(toTask(row));
});

router.put("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Task tidak ditemukan" });
  }
  const b = req.body || {};
  db.prepare(`
    UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, assignees = ?, due_in_days = ?, due_color = ?, start_date = ?, end_date = ?, project_id = ?, type = ?, subtasks = ?
    WHERE id = ?
  `).run(
    b.title ?? row.title, b.description ?? row.description, b.priority ?? row.priority, b.status ?? row.status,
    JSON.stringify(b.assignees ?? parseJson(row.assignees, [])), b.dueInDays ?? row.due_in_days, b.dueColor ?? row.due_color,
    b.startDate ?? row.start_date, b.endDate ?? row.end_date, b.projectId ?? row.project_id, b.type ?? row.type,
    JSON.stringify(b.subtasks ?? parseJson(row.subtasks, [])), row.id
  );
  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(row.id);
  res.json(toTask(updated));
});

router.delete("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Task tidak ditemukan" });
  }
  db.prepare("DELETE FROM tasks WHERE id = ?").run(row.id);
  audit(req.user.name, "Delete Task", `Task ${row.title} dihapus`);
  res.json({ message: "Task dihapus" });
});

module.exports = router;
