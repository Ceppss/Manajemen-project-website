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
    notes TEXT,
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

const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (userCount === 0) {
  const insertUser = db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)");
  for (const u of SEED_USERS) {
    insertUser.run(u.email, bcrypt.hashSync(u.password, 10), u.name, u.role);
  }
  console.log(`Seeded ${SEED_USERS.length} users.`);
}

module.exports = db;
