import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { logAudit } from "../../auth/audit";
import { useStore, createItem } from "../../auth/store";
import { getRole } from "../../auth/role";
import { getUser } from "../../auth/api";
import { visibleProjectsFor } from "../../auth/visibility";

const PRIORITY_OPTIONS = ["Not Urgent", "Middle", "Urgent"];

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-navy";

export default function AddTask() {
  const navigate = useNavigate();
  const projects = useStore("projects");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("Middle");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");

  const me = getUser();
  const myId = Number(me?.id);
  const memberProjects = visibleProjectsFor(getRole(), myId, projects);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      setError("Semua field wajib diisi, termasuk start dan finish date.");
      return;
    }
    if (endDate < startDate) {
      setError("Finish date tidak boleh sebelum start date.");
      return;
    }
    setError("");
    const project = projects.find((p) => p.id === projectId);
    await createItem("tasks", "/tasks", {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "Not Started",
      assignees: [myId],
      dueInDays: 0,
      dueColor: "ongoing",
      startDate,
      endDate,
      projectId: projectId || null,
      type: projectId ? "project" : "individual",
    });
    logAudit("Add Task", `${title.trim()} ditambahkan ${project ? `ke project ${project.name}` : "sebagai task individu"}`);
    navigate("/assignment");
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

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-2xl border border-navy/30 bg-white p-8 shadow-card">
        <label className="mb-1 block text-sm font-bold text-gray-800">Task Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
          className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy"
        />

        <label className="mb-1 block text-sm font-bold text-gray-800">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
          className="mb-6 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy"
        />

        <div className="mb-2 mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-800">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-800">Finish Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>
        </div>

        <div className="mb-2 mt-4">
          <label className="mb-1 block text-sm font-bold text-gray-800">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-56 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-navy"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2 mt-4">
          
          {memberProjects.length === 0 ? (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
              Kamu belum terdaftar di project mana pun, jadi task hanya bisa dibuat sebagai task individu.
            </p>
          ) : (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={`${inputClass} max-w-md`}
            >
              <option value="">Tidak terhubung (task individu)</option>
              {memberProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button type="submit" className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark">
            Add task
          </button>
        </div>
      </form>
    </div>
  );
}
