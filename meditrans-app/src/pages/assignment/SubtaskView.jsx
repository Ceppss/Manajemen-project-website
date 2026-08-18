import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, History, Paperclip, Plus } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
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

function formatTimestamp(date) {
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SubtaskView() {
  const { taskId, subtaskId } = useParams();
  return <SubtaskViewInner key={`${taskId}/${subtaskId}`} taskId={taskId} subtaskId={subtaskId} />;
}

function SubtaskViewInner({ taskId, subtaskId }) {
  const navigate = useNavigate();
  const tasks = useStore("tasks");
  const reports = useStore("reports");
  const task = tasks.find((t) => t.id === taskId);

  const [title, setTitle] = useState(() => task?.subtasks?.find((s) => s.id === subtaskId)?.title || "");
  const [description, setDescription] = useState(
    () => task?.subtasks?.find((s) => s.id === subtaskId)?.description || ""
  );
  const [status, setStatus] = useState(
    () => task?.subtasks?.find((s) => s.id === subtaskId)?.status || "Not Started"
  );
  const [saved, setSaved] = useState(false);
  const [editLog, setEditLog] = useState([]);
  const [lastSaved, setLastSaved] = useState({
    title: task?.subtasks?.find((s) => s.id === subtaskId)?.title || "",
    description: task?.subtasks?.find((s) => s.id === subtaskId)?.description || "",
    status: task?.subtasks?.find((s) => s.id === subtaskId)?.status || "Not Started",
  });

  if (!task) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
        Task tidak ditemukan.
      </div>
    );
  }

  const subtask = task.subtasks?.find((s) => s.id === subtaskId);
  if (!subtask) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
        Subtask tidak ditemukan.
      </div>
    );
  }

  const linkedReports = reports.filter((r) => r.subtaskId === subtaskId);

  async function handleSubmit(e) {
    e.preventDefault();
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

    await updateItem("tasks", `/tasks/${taskId}`, {
      ...task,
      subtasks: task.subtasks.map((s) => (s.id === subtaskId ? { ...s, title, description, status } : s)),
    });

    setSaved(true);
    setEditLog((log) => [
      { id: Date.now(), date: new Date(), editedBy: currentUser.name, changes },
      ...log,
    ]);
    setLastSaved({ title, description, status });
    logAudit("Edit Subtask", `${title} di task ${task.title} (${changes.map((c) => c.label).join(", ") || "no change"})`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/assignment/edit-task/${taskId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {task.title}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            SUBTASK • {task.title}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-navy">{title}</h2>
        </div>
        <StatusBadge status={status} />
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
        <label className="mb-1.5 block text-sm font-bold text-gray-800">Judul Subtask</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputClass} mb-5`}
        />

        <label className="mb-1.5 block text-sm font-bold text-gray-800">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
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
      </form>

      <div className="mt-6 rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
        <label className="mb-2 block text-sm font-bold text-gray-800">Report</label>
        <button
          type="button"
          onClick={() => navigate(`/report/add?type=project&task=${taskId}&subtask=${subtaskId}`)}
          className="mb-3 flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Report
        </button>
        <div className="space-y-2">
          {linkedReports.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-xs text-gray-400">
              Belum ada report yang terhubung ke subtask ini.
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

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
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
  );
}
