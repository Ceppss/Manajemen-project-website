import { useEffect, useMemo, useState } from "react";
import { Search, ScrollText } from "lucide-react";
import { api } from "../../auth/api";

const ACTION_STYLE = {
  "Approve Report": "bg-emerald-50 text-emerald-600",
  "Submit Report": "bg-blue-50 text-blue-600",
  "Resubmit Report": "bg-blue-50 text-blue-600",
  "Needs Revision": "bg-red-50 text-red-600",
  "Create Project": "bg-navy/10 text-navy",
  "Add Member": "bg-amber-50 text-amber-600",
  "Add Task": "bg-amber-50 text-amber-600",
  "Edit Task": "bg-amber-50 text-amber-600",
  "Add Subtask": "bg-amber-50 text-amber-600",
  "Edit Subtask": "bg-amber-50 text-amber-600",
  "Add Employee": "bg-navy/10 text-navy",
  "Edit Employee": "bg-navy/10 text-navy",
  "Delete Employee": "bg-red-50 text-red-600",
};

function formatTimestamp(value) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api("/audit")
      .then((data) => setLogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.action.toLowerCase().includes(query.toLowerCase()) ||
          l.detail.toLowerCase().includes(query.toLowerCase()) ||
          l.actor.toLowerCase().includes(query.toLowerCase())
      ),
    [query, logs]
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy">Admin - Audit Log</h2>
        <p className="mt-0.5 text-sm text-gray-400">
          Riwayat aktivitas: siapa mengubah, menambah, atau meng-assign di seluruh aplikasi.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card sm:w-80">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Audit"
          className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">Memuat data...</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">Tidak ada aktivitas yang cocok.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((l) => (
              <li key={l.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                  <ScrollText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{l.detail}</p>
                  <p className="text-xs text-gray-400">
                    {l.actor} • {formatTimestamp(l.created_at)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-md px-3 py-1 text-xs font-bold ${ACTION_STYLE[l.action] || "bg-gray-100 text-gray-600"}`}>
                  {l.action}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
