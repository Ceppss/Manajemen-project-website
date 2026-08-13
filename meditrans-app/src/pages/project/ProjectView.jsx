import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import Tabs from "../../components/Tabs";
import DonutChart from "../../components/DonutChart";
import GanttChart from "../../components/GanttChart";
import FilterableHeader from "../../components/FilterableHeader";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import { tasks, members, overviewDonuts, projects } from "../../data/mockData";

const PRIORITY_OPTIONS = ["Not Urgent", "Middle", "Urgent"];
const STATUS_OPTIONS = ["Not Started", "On going", "Finished"];

export default function ProjectView() {
  const navigate = useNavigate();
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const projectMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target)) {
        setProjectMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (priorityFilter === "all" || t.priority === priorityFilter) &&
          (statusFilter === "all" || t.status === statusFilter)
      ),
    [priorityFilter, statusFilter]
  );

  return (
    <div>
      <Tabs tabs={[{ label: "Project", to: "/project" }, { label: "Assignment", to: "/assignment" }]} />

      <div className="relative mb-6 inline-block" ref={projectMenuRef}>
        <button
          onClick={() => setProjectMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white"
        >
          {selectedProject}
          <ChevronDown className="h-4 w-4" />
        </button>

        {projectMenuOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {projects.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedProject(p);
                  setProjectMenuOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-50 ${
                  p === selectedProject ? "text-navy" : "text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-center text-base font-bold text-navy">Project Overview</h3>
          <div className="flex items-center justify-center gap-8">
            <DonutChart segments={overviewDonuts.project} size={170} strokeWidth={20} />
            <ul className="space-y-2">
              {overviewDonuts.project.map((seg) => (
                <li key={seg.label} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span
                    className="h-3.5 w-3.5 rounded-sm"
                    style={{
                      backgroundColor: { gray: "#D9D9D9", amber: "#F5A623", emerald: "#2FBF71", red: "#EB5757" }[seg.color],
                    }}
                  />
                  {seg.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-navy">Project Member</h3>
            <button className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark">
              Add member
            </button>
          </div>
          <ul className="space-y-4">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                  {m.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.role}</p>
                </div>
                <div className="w-28">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${m.progress}%` }} />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-gray-400">{m.progress}%</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for Assignment"
            className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={() => navigate("/project/add-assignment")}
          className="shrink-0 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          Add Assignment
        </button>
      </div>

      <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="rounded-tl-2xl px-5 py-3">
                <FilterableHeader
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                />
              </th>
              <th className="px-5 py-3">Works</th>
              <th className="px-5 py-3">
                <FilterableHeader
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </th>
              <th className="rounded-tr-2xl px-5 py-3">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                  Tidak ada task yang cocok dengan filter.
                </td>
              </tr>
            )}
            {filteredTasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-b-0">
                <td className="px-5 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-5 py-3 font-medium text-gray-700">{t.title}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {t.assignees.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700"
                      >
                        {members.find((m) => m.id === id)?.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        {filteredTasks.length > 0 ? (
          <GanttChart tasks={filteredTasks} />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
            Tidak ada task untuk ditampilkan di timeline.
          </div>
        )}
      </div>
    </div>
  );
}