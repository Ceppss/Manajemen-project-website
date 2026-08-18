import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  History,
  ListChecks,
  Paperclip,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import { currentUser } from "../../data/mockData";
import { logAudit } from "../../auth/audit";
import { useStore, updateItem } from "../../auth/store";

const STATUS_OPTIONS = ["Not Started", "On going", "Finished"];

const STATUS_SELECT_STYLE = {
  "Not Started": "border-gray-300 bg-gray-100 text-gray-600",
  "On going": "border-amber-300 bg-amber-100 text-amber-700",
  Finished: "border-emerald-300 bg-emerald-100 text-emerald-700",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-navy";

function connectedReports(original, reports) {
  if (!original) return [];
  return reports.filter((r) => r.task === original.title || r.title === original.title);
}

function formatTimestamp(date) {
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EditTask() {
  const { id } = useParams();
  return <EditTaskInner key={id} id={id} />;
}

function EditTaskInner({ id }) {
  const navigate = useNavigate();
  const tasks = useStore("tasks");
  const reports = useStore("reports");
  const projects = useStore("projects");
  const users = useStore("users");
  const original = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(original?.title || "");
  const [description, setDescription] = useState(original?.description || "");
  const [status, setStatus] = useState(original?.status || "Not Started");
  const [subtasks, setSubtasks] = useState(original?.subtasks || []);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [saved, setSaved] = useState(false);
  const [editLog, setEditLog] = useState([]);

  const [lastSaved, setLastSaved] = useState({
    title: original?.title || "",
    description: original?.description || "",
    status: original?.status || "Not Started",
    subtaskTitles: (original?.subtasks || []).map((s) => s.title).join("|"),
  });

  if (!original) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
        Task tidak ditemukan.
        <div className="mt-4">
          <button onClick={() => navigate("/assignment")} className="text-sm font-semibold text-navy hover:underline">
            Kembali ke Assignment
          </button>
        </div>
      </div>
    );
  }

  const linkedReports = connectedReports(original, reports);
  const assigneesText = (original.assignees || [])
    .map((aid) => users.find((u) => u.id === aid)?.name || aid)
    .join(", ");
  const project = original.projectId ? projects.find((p) => p.id === original.projectId) : null;
  const finishedCount = subtasks.filter((s) => s.status === "Finished").length;

  function openSubtaskForm() {
    setSubtaskTitle("");
    setSubtaskDescription("");
    setShowSubtaskForm(true);
  }

  function addSubtask() {
    if (!subtaskTitle.trim()) return;
    setSubtasks((list) => [
      ...list,
      {
        id: `st-${Date.now()}`,
        title: subtaskTitle.trim(),
        description: subtaskDescription.trim(),
        status: "Not Started",
      },
    ]);
    setShowSubtaskForm(false);
    setSubtaskTitle("");
    setSubtaskDescription("");
    logAudit("Add Subtask", `${subtaskTitle.trim()} ditambahkan ke ${original.title}`);
  }

  function removeSubtask(stId) {
    setSubtasks((list) => list.filter((st) => st.id !== stId));
  }

  function buildChanges() {
    const changes = [];

    if (lastSaved.status !== status) {
      changes.push({ label: "Status", detail: `${lastSaved.status} → ${status}` });
    }
    if (lastSaved.title !== title) {
      changes.push({ label: "Judul", detail: "diperbarui" });
    }
    if (lastSaved.description !== description) {
      changes.push({ label: "Deskripsi", detail: "diperbarui" });
    }

    const currentTitles = subtasks.map((s) => s.title).join("|");
    if (currentTitles !== lastSaved.subtaskTitles) {
      const done = subtasks.filter((s) => s.status === "Finished").length;
      changes.push({ label: "Subtask", detail: `${done}/${subtasks.length} selesai` });
    }

    return changes;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const changes = buildChanges();

    await updateItem("tasks", `/tasks/${original.id}`, {
      ...original,
      title,
      description,
      status,
      subtasks,
    });
    logAudit("Edit Task", `${original.id} - ${title} (${changes.map((c) => c.label).join(", ") || "no change"})`);

    setSaved(true);
    setEditLog((log) => [
      { id: Date.now(), date: new Date(), editedBy: currentUser.name, changes },
      ...log,
    ]);
    setLastSaved({
      title,
      description,
      status,
      subtaskTitles: subtasks.map((s) => s.title).join("|"),
    });
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-navy text-navy hover:bg-navy hover:text-white"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            TASK #{original.id.replace(/\D/g, "")} {project ? `• ${project.name}` : ""}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-navy">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={original.priority} />
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
            <label className="mb-1.5 block text-sm font-bold text-gray-800">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputClass} mb-5`}
            />

            <label className="mb-1.5 block text-sm font-bold text-gray-800">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className={`${inputClass} mb-5 resize-none`}
            />

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-44 rounded-lg border px-3 py-2 text-sm font-bold outline-none ${STATUS_SELECT_STYLE[status]}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
              >
                Simpan Perubahan
              </button>
            </div>

            {saved && <p className="mt-3 text-xs font-medium text-emerald-600">Perubahan tersimpan.</p>}
          </div>

          <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                <ListChecks className="h-4 w-4" />
                Subtask
                <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-bold text-navy">
                  {finishedCount}/{subtasks.length}
                </span>
              </h3>
              {!showSubtaskForm && (
                <button
                  type="button"
                  onClick={openSubtaskForm}
                  className="flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Subtask
                </button>
              )}
            </div>

            {showSubtaskForm && (
              <div className="mb-4 space-y-3 rounded-xl border border-navy/20 bg-gray-50 p-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Judul Subtask</label>
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder="Contoh: Pengecekan daya listrik"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">
                    Deskripsi <span className="font-normal text-gray-400">(opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={subtaskDescription}
                    onChange={(e) => setSubtaskDescription(e.target.value)}
                    placeholder="Detail pekerjaan subtask..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubtaskForm(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addSubtask}
                    disabled={!subtaskTitle.trim()}
                    className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {subtasks.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-xs text-gray-400">
                  Belum ada subtask.
                </p>
              )}
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700">{st.title}</p>
                    {st.description && <p className="mt-0.5 truncate text-xs text-gray-400">{st.description}</p>}
                  </div>
                  <StatusBadge status={st.status} />
                  <button
                    type="button"
                    onClick={() => navigate(`/assignment/subtask/${original.id}/${st.id}`)}
                    className="shrink-0 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSubtask(st.id)}
                    className="shrink-0 text-gray-300 transition-colors hover:text-red-500"
                    aria-label={`Hapus ${st.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
            <label className="mb-2 block text-sm font-bold text-gray-800">Report</label>
            <button
              type="button"
              onClick={() => navigate(`/report/add?type=project&task=${original.id}`)}
              className="mb-3 flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Report
            </button>
            <div className="space-y-2">
              {linkedReports.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-xs text-gray-400">
                  Belum ada report yang terhubung ke task ini.
                </p>
              )}
              {linkedReports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{r.title}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/report/detail/${r.id}`)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-sm font-bold text-navy">Task Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-gray-400">
                  <Users className="h-4 w-4" />
                  Assignee
                </span>
                <span className="font-semibold text-gray-700">{assigneesText || "-"}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-gray-400">
                  <CalendarDays className="h-4 w-4" />
                  Start
                </span>
                <span className="font-semibold text-gray-700">{original.startDate || "-"}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-gray-400">
                  <CalendarDays className="h-4 w-4" />
                  Deadline
                </span>
                <span className="font-semibold text-gray-700">{original.endDate || "-"}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy">
              <History className="h-4 w-4" />
              Log Perubahan
            </h3>
            {editLog.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada perubahan yang disimpan.</p>
            ) : (
              <ul className="space-y-3">
                {editLog.map((entry) => (
                  <li key={entry.id} className="rounded-lg bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">{entry.editedBy}</span>
                      <span className="text-gray-400">{formatTimestamp(entry.date)}</span>
                    </div>
                    {entry.changes.length === 0 ? (
                      <p className="mt-1.5 text-xs text-gray-400">Tidak ada perubahan field.</p>
                    ) : (
                      <ul className="mt-1.5 space-y-1">
                        {entry.changes.map((c, i) => (
                          <li key={i} className="text-xs text-gray-600">
                            <span className="font-medium text-gray-700">{c.label}:</span> {c.detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
