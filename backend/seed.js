// Manual seed for operational data (projects, tasks, reports, daily reports).
// Run: npm run seed
//
// The old demo data referenced the dummy lead/member accounts, which have been
// removed (see the migration in db.js). This script now just clears operational
// tables so the app starts clean with only the real superadmin account.

const db = require("./db");

db.prepare("DELETE FROM projects").run();
db.prepare("DELETE FROM tasks").run();
db.prepare("DELETE FROM reports").run();
db.prepare("DELETE FROM daily_reports").run();

console.log("Seed selesai: projects, tasks, reports, daily reports dikosongkan.");
