const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, "meditrans.db"));

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Superadmin', 'Lead Project', 'Member Project')),
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Not Started',
    progress INTEGER NOT NULL DEFAULT 0,
    total_tasks INTEGER NOT NULL DEFAULT 0,
    done_tasks INTEGER NOT NULL DEFAULT 0,
    start_date TEXT NOT NULL DEFAULT '',
    deadline TEXT NOT NULL DEFAULT '-',
    pj_id INTEGER,
    lead_ids TEXT NOT NULL DEFAULT '[]',
    member_ids TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'Middle',
    status TEXT NOT NULL DEFAULT 'Not Started',
    assignees TEXT NOT NULL DEFAULT '[]',
    due_in_days INTEGER NOT NULL DEFAULT 0,
    due_color TEXT NOT NULL DEFAULT 'ongoing',
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    project_id TEXT,
    type TEXT NOT NULL DEFAULT 'project',
    subtasks TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    photo TEXT NOT NULL DEFAULT '-',
    attachment TEXT NOT NULL DEFAULT '-',
    status TEXT NOT NULL DEFAULT 'Review',
    priority TEXT NOT NULL DEFAULT 'Middle',
    project TEXT NOT NULL DEFAULT '-',
    task TEXT NOT NULL DEFAULT '-',
    subtask TEXT,
    subtask_id TEXT,
    approval_by TEXT NOT NULL DEFAULT '[]',
    created_by INTEGER,
    approved_by TEXT NOT NULL DEFAULT '[]',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    link TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS daily_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    photo TEXT NOT NULL DEFAULT '-',
    attachment TEXT NOT NULL DEFAULT '-',
    status TEXT NOT NULL DEFAULT 'Review',
    date TEXT NOT NULL DEFAULT '',
    activity TEXT NOT NULL DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// Migration: add gps column to daily_reports if missing (older databases).
const dailyCols = db.prepare("PRAGMA table_info(daily_reports)").all().map((c) => c.name);
if (!dailyCols.includes("gps")) {
  db.exec("ALTER TABLE daily_reports ADD COLUMN gps TEXT");
  console.log("Migrated: daily_reports.gps added.");
}

// Migration: track who submitted a daily report and which leads have approved it
// (same approve-by-everyone pattern as reports.approved_by).
if (!dailyCols.includes("created_by")) {
  db.exec("ALTER TABLE daily_reports ADD COLUMN created_by INTEGER");
  console.log("Migrated: daily_reports.created_by added.");
}
if (!dailyCols.includes("approved_by")) {
  db.exec("ALTER TABLE daily_reports ADD COLUMN approved_by TEXT NOT NULL DEFAULT '[]'");
  console.log("Migrated: daily_reports.approved_by added.");
}
if (!dailyCols.includes("notes")) {
  db.exec("ALTER TABLE daily_reports ADD COLUMN notes TEXT");
  console.log("Migrated: daily_reports.notes added.");
}

// Migration: add start_date to projects if missing (older databases).
const projCols = db.prepare("PRAGMA table_info(projects)").all().map((c) => c.name);
if (!projCols.includes("start_date")) {
  db.exec("ALTER TABLE projects ADD COLUMN start_date TEXT NOT NULL DEFAULT ''");
  console.log("Migrated: projects.start_date added.");
}

// Migration: add created_by to reports (submitter user id).
const repCols = db.prepare("PRAGMA table_info(reports)").all().map((c) => c.name);
if (!repCols.includes("created_by")) {
  db.exec("ALTER TABLE reports ADD COLUMN created_by INTEGER");
  console.log("Migrated: reports.created_by added.");
}

// Migration: add approved_by to reports (ids of leads who already approved).
if (!repCols.includes("approved_by")) {
  db.exec("ALTER TABLE reports ADD COLUMN approved_by TEXT NOT NULL DEFAULT '[]'");
  console.log("Migrated: reports.approved_by added.");
}

// Migration: point the seeded superadmin account at the real owner (was a placeholder Siti Admin account).
const legacySuperadmin = db.prepare("SELECT id FROM users WHERE email = ?").get("siti.admin@meditrans.co.id");
if (legacySuperadmin) {
  db.prepare("UPDATE users SET email = ?, name = ? WHERE id = ?").run("rafipramana21@gmail.com", "Rafi Pramana", legacySuperadmin.id);
  console.log("Migrated: superadmin account updated to Rafi Pramana <rafipramana21@gmail.com>.");
}
const staleSuperadminName = db.prepare("SELECT id FROM users WHERE email = ? AND name = ?").get("rafipramana21@gmail.com", "Siti Admin");
if (staleSuperadminName) {
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run("Rafi Pramana", staleSuperadminName.id);
  console.log("Migrated: superadmin name updated to Rafi Pramana.");
}

// Migration: drop the old dummy lead/member accounts and the demo project/task/report data
// that pointed at them, so only the real superadmin account remains.
const DUMMY_EMAILS = [
  "ryan.mercer@meditrans.co.id", "rudi.hartono@meditrans.co.id", "maya.sari@meditrans.co.id",
  "doni.wijaya@meditrans.co.id", "udin@meditrans.co.id", "budi@meditrans.co.id", "bunga@meditrans.co.id",
];
const dummyPlaceholders = DUMMY_EMAILS.map(() => "?").join(",");
const dummyCount = db.prepare(`SELECT COUNT(*) AS c FROM users WHERE email IN (${dummyPlaceholders})`).get(...DUMMY_EMAILS).c;
if (dummyCount > 0) {
  db.exec("DELETE FROM projects");
  db.exec("DELETE FROM tasks");
  db.exec("DELETE FROM reports");
  db.exec("DELETE FROM daily_reports");
  db.exec("DELETE FROM notifications");
  db.prepare(`DELETE FROM users WHERE email IN (${dummyPlaceholders})`).run(...DUMMY_EMAILS);
  console.log(`Migrated: removed ${dummyCount} dummy account(s) and demo project/task/report data.`);
}

// Only users are auto-seeded (needed for login).
// Operational data (projects, tasks, reports) is seeded manually via `npm run seed`.
const SEED_USERS = [
  { email: "rafipramana21@gmail.com", password: "admin123", name: "Rafi Pramana", role: "Superadmin" },
];

const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (userCount === 0) {
  const insertUser = db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)");
  for (const u of SEED_USERS) {
    insertUser.run(u.email, bcrypt.hashSync(u.password, 10), u.name, u.role);
  }
  console.log(`Seeded ${SEED_USERS.length} users.`);
}

module.exports = db;
