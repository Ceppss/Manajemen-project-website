const express = require("express");
const db = require("../db");
const { auth, requireRole, audit, parseJson } = require("../middleware");

const router = express.Router();
router.use(auth);

const toProject = (r) => ({
  id: r.id, name: r.name, description: r.description, status: r.status, progress: r.progress,
  totalTasks: r.total_tasks, doneTasks: r.done_tasks, deadline: r.deadline,
  pjId: r.pj_id, leadIds: parseJson(r.lead_ids, []), memberIds: parseJson(r.member_ids, []),
});

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM projects ORDER BY created_at").all().map(toProject));
});

router.post("/", requireRole("Superadmin"), (req, res) => {
  const { name, description, pjId } = req.body || {};
  if (!name || !pjId) {
    return res.status(400).json({ message: "Nama project dan PJ wajib diisi" });
  }
  const id = `proj-${Date.now()}`;
  db.prepare(`
    INSERT INTO projects (id, name, description, status, progress, total_tasks, done_tasks, deadline, pj_id, lead_ids, member_ids)
    VALUES (?, ?, ?, 'Not Started', 0, 0, 0, '-', ?, '[]', '[]')
  `).run(id, name.trim(), (description || "").trim(), Number(pjId));
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  const pj = db.prepare("SELECT name FROM users WHERE id = ?").get(Number(pjId));
  audit(req.user.name, "Create Project", `${row.name} dibuat dengan PJ ${pj?.name || "-"}`);
  res.status(201).json(toProject(row));
});

router.put("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Project tidak ditemukan" });
  }
  const b = req.body || {};
  db.prepare(`
    UPDATE projects SET name = ?, description = ?, status = ?, progress = ?, total_tasks = ?, done_tasks = ?, deadline = ?, pj_id = ?, lead_ids = ?, member_ids = ?
    WHERE id = ?
  `).run(
    b.name ?? row.name,
    b.description ?? row.description,
    b.status ?? row.status,
    b.progress ?? row.progress,
    b.totalTasks ?? row.total_tasks,
    b.doneTasks ?? row.done_tasks,
    b.deadline ?? row.deadline,
    b.pjId ?? row.pj_id,
    JSON.stringify(b.leadIds ?? parseJson(row.lead_ids, [])),
    JSON.stringify(b.memberIds ?? parseJson(row.member_ids, [])),
    row.id
  );
  const updated = db.prepare("SELECT * FROM projects WHERE id = ?").get(row.id);
  res.json(toProject(updated));
});

router.delete("/:id", requireRole("Superadmin"), (req, res) => {
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Project tidak ditemukan" });
  }
  db.prepare("DELETE FROM projects WHERE id = ?").run(row.id);
  audit(req.user.name, "Delete Project", `Project ${row.name} dihapus`);
  res.json({ message: "Project dihapus" });
});

module.exports = router;
