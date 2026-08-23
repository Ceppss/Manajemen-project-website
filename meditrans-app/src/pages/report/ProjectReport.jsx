import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Paperclip, Search, Download } from "lucide-react";
import DonutChart from "../../components/DonutChart";
import FilterableHeader from "../../components/FilterableHeader";
import { PriorityBadge, StatusBadge } from "../../components/StatusBadge";
import { getRole, canSubmitReport } from "../../auth/role";
import { useStore, reportStatusSegments } from "../../auth/store";
import { parseMediaList, openDataUrl } from "../../auth/media";
const PRIORITY_OPTIONS = ["Not Urgent", "Middle", "Urgent"];
const STATUS_OPTIONS = ["Review", "Approve", "Revision"];

const LEGEND_COLORS = { amber: "#F5A623", emerald: "#2FBF71", red: "#EB5757" };

export default function ProjectReport() {
  const navigate = useNavigate();
  const reports = useStore("reports");
  const tasks = useStore("tasks");
  const projects = useStore("projects");
  const users = useStore("users");

  function submitterName(r) {
    return users.find((u) => u.id === r.createdBy)?.name || "-";
  }

  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        let task = r.task || "-";
        let project = r.project || "-";
        if (!r.task) {
          const linked = tasks.find((t) => t.title === r.title);
          if (linked) {
            task = linked.title;
            project = projects.find((p) => p.id === linked.projectId)?.name || "-";
          }
        }
        return (
          (priorityFilter === "all" || r.priority === priorityFilter) &&
          (statusFilter === "all" || r.status === statusFilter) &&
          (r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.attachment.toLowerCase().includes(query.toLowerCase()) ||
            task.toLowerCase().includes(query.toLowerCase()) ||
            project.toLowerCase().includes(query.toLowerCase()))
        );
      }),
    [query, priorityFilter, statusFilter, reports, tasks, projects]
  );

  const revisions = reports.filter((r) => r.status === "Revision");
  const canSubmit = canSubmitReport(getRole());

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-center text-base font-bold text-navy">Report Overview</h3>
          <div className="flex items-center justify-center gap-8">
            <DonutChart segments={reportStatusSegments(reports)} size={170} strokeWidth={20} />

            <ul className="space-y-2">
              {reportStatusSegments(reports).map((seg) => (
                <li key={seg.label} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: LEGEND_COLORS[seg.color] }} />
                  {seg.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-navy">
            <FileText className="h-4 w-4 text-red-500" />
            Need Revision
          </h3>
          {revisions.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Tidak ada laporan yang butuh revisi.</p>
          ) : (
            <ul className="space-y-3">
              {revisions.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">{r.title}</span>
                  <PriorityBadge priority={r.priority} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card sm:w-80">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Report"
            className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
          />
        </div>
        {canSubmit && (
          <button
            onClick={() => navigate("/report/add?type=project")}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Add Project Report
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">
                <FilterableHeader
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                />
              </th>
              <th className="px-5 py-3">Works</th>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">Task</th>
              <th className="px-5 py-3">Submitted by</th>
              <th className="px-5 py-3">
                <FilterableHeader
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </th>
              <th className="px-5 py-3">Attachment</th>
              <th className="px-5 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                  Tidak ada laporan yang cocok dengan filter.
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              let task = r.task || "-";
              let project = r.project || "-";
              if (!r.task) {
                const linked = tasks.find((t) => t.title === r.title);
                if (linked) {
                  task = linked.title;
                  project = projects.find((p) => p.id === linked.projectId)?.name || "-";
                }
              }
              return (
                <tr key={r.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-5 py-3">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-700">{r.title}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{project}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{task}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-600">{submitterName(r)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3">
                    {(() => {
                      const mediaList = parseMediaList(r.attachment);
                      if (mediaList.length === 0) {
                        return (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                            <Paperclip className="h-3.5 w-3.5" />
                            Tidak ada
                          </span>
                        );
                      }
                      const media = mediaList[0];
                      const viewable = /^data:(image\/|application\/pdf|text\/)/.test(media.data);
                      const Icon = viewable ? Paperclip : Download;
                      const extra = mediaList.length > 1 && (
                        <span className="shrink-0 text-gray-400">+{mediaList.length - 1}</span>
                      );
                      return viewable ? (
                        <button
                          type="button"
                          onClick={() => openDataUrl(media.data)}
                          className="inline-flex max-w-[180px] items-center gap-1.5 text-xs font-semibold text-navy hover:underline"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{media.name}</span>
                          {extra}
                        </button>
                      ) : (
                        <a
                          href={media.data}
                          download={media.name}
                          className="inline-flex max-w-[180px] items-center gap-1.5 text-xs font-semibold text-navy hover:underline"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{media.name}</span>
                          {extra}
                        </a>
                      );
                    })()}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
