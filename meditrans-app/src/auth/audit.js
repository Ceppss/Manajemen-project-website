import { getToken } from "./api";

export let auditLogs = [
  { id: "a1", date: "2026-08-16T09:30:00", actor: "Capt. Rudi Hartono", action: "Approve Report", detail: "PM RS Pluit disetujui" },
  { id: "a2", date: "2026-08-15T14:12:00", actor: "Capt. Maya Sari", action: "Needs Revision", detail: "Pembelian PTCS ballon dikembalikan untuk revisi" },
  { id: "a3", date: "2026-08-15T10:05:00", actor: "Bunga", action: "Submit Report", detail: "Daily report: Pengecekan BHP" },
];

export function logAudit(action, detail) {
  auditLogs.push({
    id: `a${Date.now()}`,
    date: new Date().toISOString(),
    actor: "Me",
    action,
    detail,
  });
  const token = getToken();
  if (token) {
    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, detail }),
    }).catch(() => {});
  }
}
