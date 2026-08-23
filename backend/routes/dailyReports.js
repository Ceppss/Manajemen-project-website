const express = require("express");
const db = require("../db");
const { auth, audit, parseJson } = require("../middleware");
const { notify } = require("../notifications");

const router = express.Router();
router.use(auth);
router.use((req, res, next) => {
  if (req.user?.role === "Superadmin") {
    return res.status(403).json({ message: "Daily report hanya untuk member dan lead project" });
  }
  next();
});

const toDaily = (r) => ({
  id: r.id, title: r.title, description: r.description, photo: r.photo, attachment: r.attachment,
  status: r.status, date: r.date, activity: r.activity, gps: r.gps ? JSON.parse(r.gps) : null,
  createdBy: r.created_by, approvedBy: parseJson(r.approved_by, []), notes: r.notes,
});

// All current leads, minus the given user (a lead never has to approve their own report).
function otherLeadIds(excludeUserId) {
  return db.prepare("SELECT id FROM users WHERE role = 'Lead Project'").all()
    .map((u) => u.id)
    .filter((id) => id !== excludeUserId);
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM daily_reports ORDER BY date DESC, id").all();
  const visible = req.user.role === "Lead Project" ? rows : rows.filter((r) => r.created_by === req.user.id);
  res.json(visible.map(toDaily));
});

router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.title) {
    return res.status(400).json({ message: "Judul report wajib diisi" });
  }
  const id = `dr${Date.now()}`;
  db.prepare(`
    INSERT INTO daily_reports (id, title, description, photo, attachment, status, date, activity, gps, created_by, approved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.title, b.description || "", b.photo || "-", b.attachment || "-", "Review",
    b.date || new Date().toISOString().slice(0, 10), b.activity || b.title,
    b.gps ? JSON.stringify(b.gps) : null, req.user.id, JSON.stringify([])
  );
  const row = db.prepare("SELECT * FROM daily_reports WHERE id = ?").get(id);
  audit(req.user.name, "Submit Report", `${row.title} (daily report)`);
  for (const leadId of otherLeadIds(req.user.id)) {
    notify(leadId, "Daily report perlu direview", `${req.user.name} mengirim "${row.title}" untuk direview.`, `/report/detail/${row.id}`);
  }
  res.status(201).json(toDaily(row));
});

router.put("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM daily_reports WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: "Report tidak ditemukan" });
  }
  const isOwner = row.created_by === req.user.id;
  if (!isOwner && req.user.role !== "Lead Project") {
    return res.status(403).json({ message: "Kamu tidak punya akses ke report ini" });
  }

  const b = req.body || {};
  const approvalAction = b.approval?.action;

  let approvedBy = parseJson(row.approved_by, []);
  let status = b.status ?? row.status;
  let notes = "notes" in b ? b.notes : row.notes;

  if (approvalAction === "approve" || approvalAction === "revision") {
    if (req.user.role !== "Lead Project" || isOwner) {
      return res.status(403).json({ message: "Hanya lead project lain yang bisa approve report ini" });
    }
  }

  if (approvalAction === "approve") {
    if (!approvedBy.includes(req.user.id)) approvedBy.push(req.user.id);
    const required = otherLeadIds(row.created_by);
    const allApproved = required.length > 0 && required.every((id) => approvedBy.includes(id));
    status = allApproved ? "Approve" : "Review";
    notes = null;
    audit(req.user.name, "Approve Report", `${row.title} disetujui${allApproved ? "" : " (menunggu lead lain)"}`);
    if (allApproved && row.created_by) {
      notify(row.created_by, "Daily report disetujui", `"${row.title}" telah disetujui semua lead.`, `/report/detail/${row.id}`);
    }
  } else if (approvalAction === "revision") {
    approvedBy = [];
    status = "Revision";
    notes = b.approval?.notes ?? null;
    audit(req.user.name, "Needs Revision", `${row.title} dikembalikan: ${notes || ""}`);
    if (row.created_by) {
      notify(row.created_by, "Daily report perlu revisi", `"${row.title}" dikembalikan${notes ? `: ${notes}` : "."}`, `/report/detail/${row.id}`);
    }
  } else if (status === "Review") {
    approvedBy = [];
  }

  db.prepare(`
    UPDATE daily_reports SET title = ?, description = ?, photo = ?, attachment = ?, status = ?, date = ?, activity = ?, gps = ?, approved_by = ?, notes = ?
    WHERE id = ?
  `).run(
    b.title ?? row.title, b.description ?? row.description, b.photo ?? row.photo, b.attachment ?? row.attachment,
    status, b.date ?? row.date, b.activity ?? row.activity,
    b.gps ? JSON.stringify(b.gps) : row.gps, JSON.stringify(approvedBy), notes, row.id
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
