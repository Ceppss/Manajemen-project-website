import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Minus, History } from "lucide-react";
import { tasks, currentUser } from "../../data/mockData";

const STATUS_OPTIONS = ["Not Started", "On going", "Finished"];

const STATUS_SELECT_STYLE = {
  "Not Started": "border-gray-300 bg-gray-100 text-gray-600",
  "On going": "border-amber-300 bg-amber-100 text-amber-700",
  Finished: "border-emerald-300 bg-emerald-100 text-emerald-700",
};

const DEFAULT_ATTACHMENTS = ["Report.pdf", "Report-2.pdf"];

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
  const navigate = useNavigate();
  const { id } = useParams();
  const original = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(original?.title || "");
  const [description, setDescription] = useState(original?.description || "");
  const [status, setStatus] = useState(original?.status || "Not Started");
  const [attachments, setAttachments] = useState(DEFAULT_ATTACHMENTS);
  const [saved, setSaved] = useState(false);
  const [editLog, setEditLog] = useState([]);

  const [lastSaved, setLastSaved] = useState({
    title: original?.title || "",
    description: original?.description || "",
    status: original?.status || "Not Started",
    attachments: DEFAULT_ATTACHMENTS,
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

  function handleAddAttachment() {
    const name = `Report-${attachments.length + 1}.pdf`;
    setAttachments((list) => [...list, name]);
  }

  function handleRemoveAttachment(index) {
    setAttachments((list) => list.filter((_, i) => i !== index));
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

    const added = attachments.filter((f) => !lastSaved.attachments.includes(f));
    const removed = lastSaved.attachments.filter((f) => !attachments.includes(f));
    if (added.length > 0) {
      changes.push({ label: "Attachment ditambahkan", detail: added.join(", ") });
    }
    if (removed.length > 0) {
      changes.push({ label: "Attachment dihapus", detail: removed.join(", ") });
    }

    return changes;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const changes = buildChanges();

    setSaved(true);
    setEditLog((log) => [
      { id: Date.now(), date: new Date(), editedBy: currentUser.name, changes },
      ...log,
    ]);
    setLastSaved({ title, description, status, attachments });
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex h-9 w-9 items-center justify-center rounded-full border border-navy text-navy hover:bg-navy hover:text-white"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl rounded-2xl border border-navy/30 bg-white p-8 shadow-card"
      >
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-800">Task Title</label>
          <span className="text-xs text-gray-400">DD/MM/YYYY</span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy"
        />

        <label className="mb-1 block text-sm font-bold text-gray-800">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={7}
          className="mb-6 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy"
        />

        <label className="mb-1 block text-sm font-bold text-gray-800">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`mb-6 w-44 rounded-lg border px-3 py-2 text-sm font-bold outline-none ${STATUS_SELECT_STYLE[status]}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm font-bold text-gray-800">Attachment</label>
        <button
          type="button"
          onClick={handleAddAttachment}
          className="mb-3 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark"
        >
          Add Attachment
        </button>
        <div className="space-y-2">
          {attachments.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700"
            >
              {file}
              <button
                type="button"
                onClick={() => handleRemoveAttachment(i)}
                className="text-gray-400 hover:text-red-500"
                aria-label={`Remove ${file}`}
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {saved && <p className="mt-4 text-xs font-medium text-emerald-600">Perubahan tersimpan.</p>}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Edit Task
          </button>
        </div>
      </form>

      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
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