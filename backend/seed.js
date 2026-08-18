// Manual seed for operational data (projects, tasks, reports, daily reports).
// Run: npm run seed

const db = require("./db");

const j = (v) => JSON.stringify(v);

const SEED_PROJECTS = [
  {
    id: "rs-mintoharjo", name: "RS MintoHarjo",
    description: "Preventive maintenance alat radiologi RS Mintoharjo.",
    status: "On going", progress: 62, total_tasks: 12, done_tasks: 7,
    deadline: "2026-09-30", pj_id: 3, lead_ids: [4], member_ids: [6, 7, 8],
  },
  {
    id: "rs-pluit", name: "RS Pluit",
    description: "Preventive maintenance alat medis di RS Pluit.",
    status: "Finished", progress: 100, total_tasks: 8, done_tasks: 8,
    deadline: "2026-08-18", pj_id: 4, lead_ids: [], member_ids: [6, 8],
  },
  {
    id: "rsal", name: "RSAL",
    description: "Preventive maintenance alat di RSAL.",
    status: "On going", progress: 45, total_tasks: 10, done_tasks: 4,
    deadline: "2026-09-20", pj_id: 5, lead_ids: [3], member_ids: [7, 8],
  },
  {
    id: "rs-sanglah", name: "RS Sanglah",
    description: "Instalasi peralatan cathlab baru di RS Sanglah.",
    status: "Not Started", progress: 0, total_tasks: 15, done_tasks: 0,
    deadline: "2026-10-15", pj_id: 3, lead_ids: [5], member_ids: [6, 7],
  },
];

const SEED_TASKS = [
  {
    id: "t1", title: "Instalasi Cathlab",
    description: "Pemasangan unit cathlab baru di ruang tindakan 2.",
    priority: "Not Urgent", status: "On going", assignees: [6, 7],
    due_in_days: 5, due_color: "overdue", start_date: "2026-08-01", end_date: "2026-08-20",
    project_id: "rs-sanglah", type: "project",
    subtasks: [
      { id: "st1", title: "Koordinasi ruang tindakan 2", description: "Menjadwalkan persiapan ruang dengan tim medis.", status: "Finished" },
      { id: "st2", title: "Pengecekan daya listrik", description: "Pastikan kebutuhan daya sesuai spesifikasi unit.", status: "On going" },
      { id: "st3", title: "Uji coba alat cathlab", description: "Menjalankan uji fungsi bersama vendor.", status: "Not Started" },
    ],
  },
  {
    id: "t2", title: "Pembelian Cateter",
    description: "Pengadaan cateter sesuai permintaan tim medis.",
    priority: "Middle", status: "On going", assignees: [7],
    due_in_days: 7, due_color: "finished", start_date: "2026-08-05", end_date: "2026-08-25",
    project_id: "rs-pluit", type: "project", subtasks: [],
  },
  {
    id: "t3", title: "PM RS Pluit",
    description: "Preventive maintenance alat di RS Pluit.",
    priority: "Urgent", status: "Finished", assignees: [6],
    due_in_days: 12, due_color: "ongoing", start_date: "2026-08-10", end_date: "2026-08-18",
    project_id: "rs-pluit", type: "project", subtasks: [],
  },
  {
    id: "t4", title: "Service Minto",
    description: "Servis rutin alat radiologi RS Mintoharjo.",
    priority: "Middle", status: "On going", assignees: [7, 8],
    due_in_days: 3, due_color: "overdue", start_date: "2026-08-15", end_date: "2026-09-05",
    project_id: "rs-mintoharjo", type: "project", subtasks: [],
  },
  {
    id: "t5", title: "Pembelian BHP",
    description: "Pengadaan bahan habis pakai bulan ini.",
    priority: "Middle", status: "Not Started", assignees: [7],
    due_in_days: 14, due_color: "overdue", start_date: "2026-08-20", end_date: "2026-09-10",
    project_id: "rs-mintoharjo", type: "project", subtasks: [],
  },
  {
    id: "t6", title: "PM RSAL",
    description: "Preventive maintenance alat di RSAL.",
    priority: "Urgent", status: "Not Started", assignees: [8, 6],
    due_in_days: 20, due_color: "ongoing", start_date: "2026-09-01", end_date: "2026-09-20",
    project_id: "rsal", type: "project", subtasks: [],
  },
  {
    id: "t7", title: "Laporan lembur bulanan",
    description: "Menyusun laporan lembur untuk approval HR.",
    priority: "Not Urgent", status: "Not Started", assignees: [6],
    due_in_days: 10, due_color: "ongoing", start_date: "2026-08-20", end_date: "2026-08-30",
    project_id: null, type: "individual", subtasks: [],
  },
  {
    id: "t8", title: "Renewal sertifikasi K3",
    description: "Perpanjangan sertifikat K3 sebelum masa berlaku habis.",
    priority: "Middle", status: "On going", assignees: [8],
    due_in_days: 21, due_color: "overdue", start_date: "2026-08-05", end_date: "2026-09-05",
    project_id: null, type: "individual", subtasks: [],
  },
  {
    id: "t9", title: "Pelatihan operator alat",
    description: "Mengikuti pelatihan operator alat baru di HQ.",
    priority: "Urgent", status: "On going", assignees: [6, 7],
    due_in_days: 4, due_color: "overdue", start_date: "2026-08-18", end_date: "2026-08-20",
    project_id: null, type: "individual", subtasks: [],
  },
];

const SEED_REPORTS = [
  { id: "r1", priority: "Not Urgent", title: "Instalasi Cathlab", status: "Review", attachment: "Report 1", description: "Laporan progres instalasi cathlab.", project: "RS Sanglah", task: "Instalasi Cathlab", subtask: null, subtask_id: null, approval_by: [3, 5], notes: null, photo: "-" },
  { id: "r2", priority: "Middle", title: "Pembelian Cateter", status: "Review", attachment: "Report 2", description: "Laporan pengadaan cateter.", project: "RS Pluit", task: "Pembelian Cateter", subtask: null, subtask_id: null, approval_by: [4], notes: null, photo: "-" },
  { id: "r3", priority: "Urgent", title: "PM RS PLuit", status: "Approve", attachment: "Report 3", description: "Laporan preventive maintenance RS Pluit.", project: "RS Pluit", task: "PM RS Pluit", subtask: null, subtask_id: null, approval_by: [4], notes: null, photo: "-" },
  { id: "r4", priority: "Middle", title: "Service Minto", status: "Review", attachment: "Report 4", description: "Laporan servis alat radiologi RS MintoHarjo.", project: "RS MintoHarjo", task: "Service Minto", subtask: null, subtask_id: null, approval_by: [3], notes: null, photo: "-" },
  { id: "r5", priority: "Middle", title: "Pembelian BHP", status: "Review", attachment: "Report 5", description: "Laporan pengadaan bahan habis pakai.", project: "RS MintoHarjo", task: "Pembelian BHP", subtask: null, subtask_id: null, approval_by: [3], notes: null, photo: "-" },
  { id: "r6", priority: "Urgent", title: "PM RSAL", status: "Approve", attachment: "Report 6", description: "Laporan preventive maintenance RSAL.", project: "RSAL", task: "PM RSAL", subtask: null, subtask_id: null, approval_by: [5], notes: null, photo: "-" },
  { id: "r7", priority: "Not Urgent", title: "Pembelian PTCS ballon", status: "Revision", attachment: "Report 7", description: "Laporan pembelian PTCS ballon.", project: "RS Pluit", task: "Pembelian Cateter", subtask: null, subtask_id: null, approval_by: [4], notes: "Lampiran PO belum lengkap.", photo: "-" },
  { id: "r8", priority: "Not Urgent", title: "Service CT scan", status: "Approve", attachment: "Report 8", description: "Laporan servis CT scan.", project: "RS MintoHarjo", task: "Service Minto", subtask: null, subtask_id: null, approval_by: [3], notes: null, photo: "-" },
];

const SEED_DAILY = [
  { id: "dr1", date: "2026-08-16", activity: "Koordinasi jadwal PM RS Pluit", description: "Menyusun jadwal preventive maintenance bersama tim lapangan.", status: "Approve", title: "Koordinasi jadwal PM RS Pluit", photo: "-", attachment: "-" },
  { id: "dr2", date: "2026-08-15", activity: "Monitoring instalasi Cathlab", description: "Pengecekan progres instalasi cathlab di ruang tindakan 2.", status: "Review", title: "Monitoring instalasi Cathlab", photo: "-", attachment: "-" },
  { id: "dr3", date: "2026-08-14", activity: "Pengadaan cateter", description: "Follow up status pengadaan cateter dengan vendor.", status: "Approve", title: "Pengadaan cateter", photo: "-", attachment: "-" },
  { id: "dr4", date: "2026-08-13", activity: "Servis alat radiologi RS MintoHarjo", description: "Pendampingan teknisi saat servis rutin alat radiologi.", status: "Revision", title: "Servis alat radiologi RS MintoHarjo", photo: "-", attachment: "-" },
  { id: "dr5", date: "2026-08-12", activity: "Revisi laporan PM RSAL", description: "Perbaikan laporan preventive maintenance sesuai feedback direktur.", status: "Review", title: "Revisi laporan PM RSAL", photo: "-", attachment: "-" },
  { id: "dr6", date: "2026-08-11", activity: "Pengecekan BHP", description: "Inventaris bahan habis pakai dan pemesanan ulang.", status: "Approve", title: "Pengecekan BHP", photo: "-", attachment: "-" },
];

const j2 = (v) => JSON.stringify(v);

db.prepare("DELETE FROM projects").run();
db.prepare("DELETE FROM tasks").run();
db.prepare("DELETE FROM reports").run();
db.prepare("DELETE FROM daily_reports").run();

const insertProject = db.prepare(`
  INSERT INTO projects (id, name, description, status, progress, total_tasks, done_tasks, deadline, pj_id, lead_ids, member_ids)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const p of SEED_PROJECTS) {
  insertProject.run(p.id, p.name, p.description, p.status, p.progress, p.total_tasks, p.done_tasks, p.deadline, p.pj_id, j(p.lead_ids), j(p.member_ids));
}

const insertTask = db.prepare(`
  INSERT INTO tasks (id, title, description, priority, status, assignees, due_in_days, due_color, start_date, end_date, project_id, type, subtasks)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const t of SEED_TASKS) {
  insertTask.run(t.id, t.title, t.description, t.priority, t.status, j(t.assignees), t.due_in_days, t.due_color, t.start_date, t.end_date, t.project_id, t.type, j(t.subtasks));
}

const insertReport = db.prepare(`
  INSERT INTO reports (id, title, description, photo, attachment, status, priority, project, task, subtask, subtask_id, approval_by, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const r of SEED_REPORTS) {
  insertReport.run(r.id, r.title, r.description, r.photo, r.attachment, r.status, r.priority, r.project, r.task, r.subtask, r.subtask_id, j2(r.approval_by), r.notes);
}

const insertDaily = db.prepare(`
  INSERT INTO daily_reports (id, title, description, photo, attachment, status, date, activity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const d of SEED_DAILY) {
  insertDaily.run(d.id, d.title, d.description, d.photo, d.attachment, d.status, d.date, d.activity);
}

console.log("Seed selesai: projects, tasks, reports, daily reports.");
