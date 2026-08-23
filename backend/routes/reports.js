const express = require("express");
const db = require("../db");
const { auth, audit, parseJson } = require("../middleware");
const { notify } = require("../notifications");

const router = express.Router();
router.use(auth);

const toReport = (r) => ({
  id: r.id, title: r.title, description: r.description, photo: r.photo, attachment: r.attachment,
  status: r.status, priority: r.priority, project: r.project, task: r.task,
  subtask: r.subtask, subtaskId: r.subtask_id, approvalBy: parseJson(r.approval_by, []),
  createdBy: r.created_by, approvedBy: parseJson(r.approved_by, []), notes: r.notes,
});

function canSee(user, row) {
  if (user.role !== "Lead Project" && user.role !== "Member Project") return true;
  const approvers = parseJson(row.approval_by, []);
  const isApprover = approvers.includes(user.id);
  const isCreator = Number(row.created_by) === user.id;
  return isApprover || isCreator;
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM reports ORDER BY id").all();
  res.json(rows.filter((r) => canSee(req.user, r)).map(toReport));
});

router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.title) {
    return res.status(400).json({ message: "Judul report wajib diisi" });
  }
  if (!Array.isArray(b.approvalBy) || b.approvalBy.length === 0) {
    return res.status(400).json({ message: "Minimal satu approver wajib dipilih" });
  }
  const id = `r${Date.now()}`;
  db.prepare(`
    INSERT INTO reports (id, title, description, photo, attachment, status, priority, project, task, subtask, subtask_id, approval_by, created_by, approved_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.title, b.description || "", b.photo || "-", b.attachment || "-", b.status || "Review",
    b.priority || "Middle", b.project || "-", b.task || "-", b.subtask || null, b.subtaskId || null,
    JSON.stringify(b.approvalBy || []), req.user.id, JSON.stringify([]), b.notes || null
  );
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id);
  audit(req.user.name, "Submit Report", `${row.title} disubmit`);
  for (const approverId of b.approvalBy || []) {
    notify(approverId, "Report perlu direview", `${req.user.name} mengirim "${row.title}" untuk direview.`, `/report/detail/${row.id}`);
  }
  res.status(201).json(toReport(row));
});

router.put("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Report tidak ditemukan" });
  }
  const b = req.body || {};
  const approvalAction = b.approval?.action;

  let approvedBy = parseJson(row.approved_by, []);
  let status = b.status ?? row.status;
  let notes = "notes" in b ? b.notes : row.notes;

  if (approvalAction === "approve" || approvalAction === "revision") {
    const approvers = parseJson(row.approval_by, []);
    const isApprover = approvers.includes(req.user.id);
    if (req.user.role !== "Superadmin" && !isApprover) {
      return res.status(403).json({ message: "Kamu bukan approver report ini" });
    }
  }

  if (approvalAction === "approve") {
    if (!approvedBy.includes(req.user.id)) approvedBy.push(req.user.id);
    const approvers = parseJson(row.approval_by, []);
    const allApproved = approvers.length > 0 && approvers.every((id) => approvedBy.includes(id));
    status = allApproved ? "Approve" : "Review";
    notes = null;
    audit(req.user.name, "Approve Report", `${row.title} disetujui${allApproved ? "" : " (menunggu lead lain)"}`);
    if (allApproved && row.created_by) {
      notify(row.created_by, "Report disetujui", `"${row.title}" telah disetujui semua approver.`, `/report/detail/${row.id}`);
    }
  } else if (approvalAction === "revision") {
    approvedBy = [];
    status = "Revision";
    notes = b.approval?.notes ?? null;
    audit(req.user.name, "Needs Revision", `${row.title} dikembalikan: ${notes || ""}`);
    if (row.created_by) {
      notify(row.created_by, "Report perlu revisi", `"${row.title}" dikembalikan${notes ? `: ${notes}` : "."}`, `/report/detail/${row.id}`);
    }
  } else if (status === "Review") {
    approvedBy = [];
  }

  db.prepare(`
    UPDATE reports SET title = ?, description = ?, photo = ?, attachment = ?, status = ?, priority = ?, project = ?, task = ?, subtask = ?, subtask_id = ?, approval_by = ?, approved_by = ?, notes = ?
    WHERE id = ?
  `).run(
    b.title ?? row.title, b.description ?? row.description, b.photo ?? row.photo, b.attachment ?? row.attachment,
    status, b.priority ?? row.priority, b.project ?? row.project, b.task ?? row.task,
    b.subtask ?? row.subtask, b.subtaskId ?? row.subtask_id,
    JSON.stringify(b.approvalBy ?? parseJson(row.approval_by, [])),
    JSON.stringify(approvedBy), notes, row.id
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
