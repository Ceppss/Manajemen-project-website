import { useState } from "react";
import { ImagePlus, MapPin, Paperclip } from "lucide-react";
import exifr from "exifr";
import { useStore, useLeads } from "../../auth/store";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-navy";

export default function ReportForm({ isProject, initial, submitLabel = "Submit Report", onSubmit, onCancel }) {
  const projects = useStore("projects");
  const tasks = useStore("tasks");
  const leads = useLeads();

  function projectLeadsFor(projectId) {
    if (!projectId) return [];
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];
    const ids = [project.pjId, ...(project.leadIds || [])].filter(Boolean);
    return leads.filter((l) => ids.includes(l.id));
  }

  function resolveIds(from) {
    let projectId = projects.find((p) => p.name === from.project)?.id || "";
    let taskId = tasks.find((t) => t.title === from.task)?.id || "";
    if (!taskId && !projectId) {
      const task = tasks.find((t) => t.title === from.title);
      if (task) {
        taskId = task.id;
        projectId = task.projectId;
      }
    }
    const leadIds = (from.approvalBy || []).filter((id) => leads.some((l) => l.id === id));
    return { projectId, taskId, leadIds };
  }
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [photoName, setPhotoName] = useState(initial?.photo && initial.photo !== "-" ? initial.photo : "");
  const [photoPreview, setPhotoPreview] = useState("");
  const [gps, setGps] = useState(initial?.gps || null);
  const [gpsReading, setGpsReading] = useState(false);
  const [attachment, setAttachment] = useState(
    initial?.attachment && initial.attachment !== "-" ? initial.attachment : ""
  );

  const resolved = initial ? resolveIds(initial) : { projectId: "", taskId: "", leadIds: [] };
  const [projectId, setProjectId] = useState(resolved.projectId);
  const [taskId, setTaskId] = useState(resolved.taskId);
  const [leadIds, setLeadIds] = useState(resolved.leadIds);

  const projectTasks = projectId ? tasks.filter((t) => t.projectId === projectId) : [];
  const availableLeads = projectLeadsFor(projectId);
  function toggleLead(id) {
    setLeadIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
    if (isProject) return;
    setGpsReading(true);
    setGps(null);
    try {
      const gpsData = await exifr.gps(file);
      if (gpsData?.latitude && gpsData?.longitude) {
        setGps({ lat: gpsData.latitude, lng: gpsData.longitude });
      }
    } catch {
      // foto tanpa metadata GPS → biarkan null
    } finally {
      setGpsReading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      title,
      description,
      photo: photoName || "-",
      attachment: attachment || "-",
      projectId,
      taskId,
      leadIds,
      gps,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Judul</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul report"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Deskripsi</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi kegiatan yang dilaporkan"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Foto</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-500 hover:border-navy hover:text-navy">
            <ImagePlus className="h-4 w-4" />
            {photoName || "Upload foto"}
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
          {photoPreview && (
            <img src={photoPreview} alt="preview" className="mt-2 h-28 w-full rounded-lg object-cover" />
          )}
          {!isProject && gpsReading && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <MapPin className="h-3.5 w-3.5 animate-pulse" />
              Membaca lokasi dari foto...
            </p>
          )}
          {!isProject && !gpsReading && gps && (
            <a
              href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              GPS: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)} — Buka Maps
            </a>
          )}
          {!isProject && !gpsReading && !gps && photoName && (
            <p className="mt-2 text-xs font-semibold text-gray-400">Tidak ada data GPS di foto ini.</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Attachment</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-500 hover:border-navy hover:text-navy">
            <Paperclip className="h-4 w-4" />
            {attachment || "Upload file"}
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0]?.name || "")}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {isProject && (
        <div className="space-y-5 rounded-xl bg-gray-50 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Terhubung ke Project</label>
            <select
              required
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setTaskId("");
                setLeadIds([]);
              }}
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
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Terhubung ke Task</label>
            <select
              required
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              disabled={!projectId}
              className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-100`}
            >
              <option value="" disabled>
                {projectId ? "Pilih task" : "Pilih project dulu"}
              </option>
              {projectTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Perlu approval dari lead project
            </label>
            {availableLeads.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
                {projectId
                  ? "Project ini belum punya lead project selain PJ."
                  : "Pilih project dulu untuk melihat lead project."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {availableLeads.map((l) => (
                  <label
                    key={l.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      leadIds.includes(l.id)
                        ? "border-navy bg-navy text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-navy/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={leadIds.includes(l.id)}
                      onChange={() => toggleLead(l.id)}
                      className="hidden"
                    />
                    {l.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
