import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Minus, ChevronDown } from "lucide-react";
import { logAudit } from "../../auth/audit";
import { useMembers, useStore, createItem } from "../../auth/store";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-navy";

export default function AddAssignment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedProjectId = searchParams.get("project") || "";
  const members = useMembers();
  const projects = useStore("projects");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [projectId, setProjectId] = useState(linkedProjectId);
  const [assignees, setAssignees] = useState([]);
  const [error, setError] = useState("");

  function handleAddAssignee(e) {
    const id = e.target.value;
    if (id && !assignees.includes(id)) {
      setAssignees((list) => [...list, id]);
    }
    e.target.value = "";
  }

  function handleRemoveAssignee(id) {
    setAssignees((list) => list.filter((a) => a !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !projectId || assignees.length === 0) {
      setError("Semua field wajib diisi, termasuk project dan minimal satu assignee.");
      return;
    }
    setError("");
    const project = projects.find((p) => p.id === projectId);
    await createItem("tasks", "/tasks", {
      title: title.trim(),
      description: description.trim(),
      priority: "Middle",
      status: "Not Started",
      assignees,
      dueInDays: 0,
      dueColor: "ongoing",
      startDate: date,
      endDate: date,
      projectId,
      type: "project",
    });
    logAudit("Add Task", `${title.trim()} diassign ke ${assignees.length} member (project ${project?.name || "-"})`);
    navigate("/project");
  }

  const availableMembers = members.filter((m) => !assignees.includes(m.id));

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex h-9 w-9 items-center justify-center rounded-full border border-navy text-navy hover:bg-navy hover:text-white"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-navy">
          Assign Project:{" "}
          <span className="text-navy/70">
            {linkedProjectId ? projects.find((p) => p.id === linkedProjectId)?.name || "-" : "Pilih di bawah"}
          </span>
        </h2>
      </div>

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
          rows={7}
          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
          className="mb-6 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy"
        />

        <div className="mb-6 grid grid-cols-2 gap-8">
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-800">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-800">Terhubung ke Project</label>
            {linkedProjectId ? (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-100 px-4 py-2.5">
                <span className="text-sm font-semibold text-gray-700">
                  {projects.find((p) => p.id === linkedProjectId)?.name || "-"}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Otomatis terhubung</span>
              </div>
            ) : (
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Pilih project
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-bold text-gray-800">Assign too</label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <select
                onChange={handleAddAssignee}
                defaultValue=""
                className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-navy"
              >
                <option value="" disabled>Name</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="mt-3 space-y-2 sm:mt-0">
              {assignees.map((id) => {
                const m = members.find((mm) => mm.id === id);
                return (
                  <div key={id} className="flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">
                    {m?.name}
                    <button type="button" onClick={() => handleRemoveAssignee(id)} className="text-gray-400 hover:text-red-500" aria-label={`Remove ${m?.name}`}>
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {error && <p className="mb-4 text-xs font-medium text-red-500">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark">
            Add Assignment
          </button>
        </div>
      </form>
    </div>
  );
}