import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, UserPlus, X } from "lucide-react";
import DonutChart from "../../components/DonutChart";
import GanttChart from "../../components/GanttChart";
import FilterableHeader from "../../components/FilterableHeader";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import { getRole, isLead } from "../../auth/role";
import { logAudit } from "../../auth/audit";
import { useStore, updateItem, taskStatusSegments } from "../../auth/store";

const PRIORITY_OPTIONS = ["Not Urgent", "Middle", "Urgent"];
const STATUS_OPTIONS = ["Not Started", "On going", "Finished"];

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-navy";

export default function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projects = useStore("projects");
  const tasks = useStore("tasks");
  const users = useStore("users");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberType, setMemberType] = useState("member");
  const [personId, setPersonId] = useState("");

  const role = getRole();
  const canManage = isLead(role);
  const project = projects.find((p) => p.id === id) || projects[0];

  const leads = users.filter((u) => u.role === "Lead Project");
  const members = users.filter((u) => u.role === "Member Project");
  const pj = users.find((u) => u.id === project.pjId);
  const projectLeads = (project.leadIds || [])
    .map((lid) => users.find((u) => u.id === lid))
    .filter(Boolean);
  const projectMembers = (project.memberIds || [])
    .map((mid) => users.find((u) => u.id === mid))
    .filter(Boolean);

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (priorityFilter === "all" || t.priority === priorityFilter) &&
          (statusFilter === "all" || t.status === statusFilter) &&
          (query === "" ||
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.description.toLowerCase().includes(query.toLowerCase()))
      ),
    [priorityFilter, statusFilter, query, tasks]
  );

  const availableLeads = leads.filter(
    (l) => l.id !== project.pjId && !(project.leadIds || []).includes(l.id)
  );
  const availableMembers = members.filter((m) => !(project.memberIds || []).includes(m.id));

  async function handleAddPerson() {
    if (!personId) return;
    const nextLeadIds = memberType === "lead" ? [...(project.leadIds || []), personId] : project.leadIds || [];
    const nextMemberIds = memberType === "member" ? [...(project.memberIds || []), personId] : project.memberIds || [];
    await updateItem("projects", `/projects/${project.id}`, {
      ...project,
      leadIds: nextLeadIds,
      memberIds: nextMemberIds,
    });
    const person = users.find((u) => u.id === personId);
    logAudit("Add Member", `${person?.name} ditambahkan ke ${project.name} (${memberType === "lead" ? "lead" : "member"})`);
    setPersonId("");
    setShowAddMember(false);
  }

  return (
    <div>
      <Link
        to="/project"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy">{project.name}</h2>
          <p className="mt-0.5 text-sm text-gray-400">
            PJ: {pj?.name || "-"} {pj ? `(${pj.role})` : ""}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-center text-base font-bold text-navy">Project Overview</h3>
          <div className="flex items-center justify-center gap-8">
            <DonutChart segments={taskStatusSegments(tasks)} size={170} strokeWidth={20} />
            <ul className="space-y-2">
              {taskStatusSegments(tasks).map((seg) => (
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
            {canManage && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add member
              </button>
            )}
          </div>
          <ul className="space-y-4">
            {projectMembers.length === 0 && projectLeads.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">Belum ada member di project ini.</p>
            )}
            {projectMembers.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                  {m.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.role}</p>
                </div>
              </li>
            ))}
            {projectLeads.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  {l.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{l.name}</p>
                  <p className="text-xs text-gray-400">{l.role}</p>
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Assignment"
            className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
          />
        </div>
        {canManage && (
          <button
            onClick={() => navigate(`/project/add-assignment?project=${project.id}`)}
            className="shrink-0 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Add Assignment
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-sm">
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
              <th className="rounded-tr-2xl px-5 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
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
                    {t.assignees.map((aid) => (
                      <span
                        key={aid}
                        className="inline-flex items-center rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700"
                      >
                        {users.find((u) => u.id === aid)?.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => navigate(`/assignment/edit-task/${t.id}`)}
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

      <div className="mt-6">
        {filteredTasks.length > 0 ? (
          <GanttChart tasks={filteredTasks} />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
            Tidak ada task untuk ditampilkan di timeline.
          </div>
        )}
      </div>

      {showAddMember && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-navy">Add Member</h2>
              <button
                onClick={() => setShowAddMember(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberType("member");
                      setPersonId("");
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      memberType === "member"
                        ? "border-navy bg-navy text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-navy/40"
                    }`}
                  >
                    Member Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMemberType("lead");
                      setPersonId("");
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      memberType === "lead"
                        ? "border-navy bg-navy text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-navy/40"
                    }`}
                  >
                    Lead Project
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  {memberType === "lead" ? "Pilih Lead Project" : "Pilih Member Project"}
                </label>
                {memberType === "lead" ? (
                  availableLeads.length === 0 ? (
                    <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
                      Semua lead sudah ada di project ini.
                    </p>
                  ) : (
                    <select value={personId} onChange={(e) => setPersonId(e.target.value)} className={inputClass}>
                      <option value="" disabled>
                        Pilih lead
                      </option>
                      {availableLeads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  )
                ) : availableMembers.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
                    Semua member sudah ada di project ini.
                  </p>
                ) : (
                  <select value={personId} onChange={(e) => setPersonId(e.target.value)} className={inputClass}>
                    <option value="" disabled>
                      Pilih member
                    </option>
                    {availableMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPerson}
                  disabled={!personId}
                  className="flex-1 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
