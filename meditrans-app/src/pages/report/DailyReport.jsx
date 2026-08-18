import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import FilterableHeader from "../../components/FilterableHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useStore } from "../../auth/store";

const STATUS_OPTIONS = ["Review", "Approve", "Revision"];

export default function DailyReport() {
  const navigate = useNavigate();
  const dailyReports = useStore("dailyReports");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(
    () =>
      dailyReports.filter(
        (r) =>
          (statusFilter === "all" || r.status === statusFilter) &&
          (r.activity.toLowerCase().includes(query.toLowerCase()) ||
            r.description.toLowerCase().includes(query.toLowerCase()))
      ),
    [query, statusFilter, dailyReports]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card sm:w-80">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Daily Report"
            className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={() => navigate("/report/add?type=daily")}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          Add Daily Report
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Daily Activity</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">
                <FilterableHeader
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </th>
              <th className="px-5 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  Tidak ada daily report yang cocok dengan filter.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-b-0">
                <td className="whitespace-nowrap px-5 py-3 font-semibold text-gray-700">{r.date}</td>
                <td className="px-5 py-3 font-medium text-gray-700">{r.activity}</td>
                <td className="px-5 py-3 text-gray-500">{r.description}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => navigate(`/report/detail/${r.id}`)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
