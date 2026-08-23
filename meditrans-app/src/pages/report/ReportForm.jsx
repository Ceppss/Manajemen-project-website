import { useState } from "react";
import { ImagePlus, MapPin, Paperclip, X } from "lucide-react";
import exifr from "exifr";
import { useStore, useLeads } from "../../auth/store";
import { parseMediaList, readFileAsDataUrl, resizeImage, openDataUrl } from "../../auth/media";

const PRIORITY_OPTIONS = ["Not Urgent", "Middle", "Urgent"];

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
  const [priority, setPriority] = useState(initial?.priority || "Middle");
  const [photos, setPhotos] = useState(parseMediaList(initial?.photo));
  const [attachments, setAttachments] = useState(parseMediaList(initial?.attachment));
  const [gps, setGps] = useState(initial?.gps || null);
  const [gpsReading, setGpsReading] = useState(false);
  const [error, setError] = useState("");

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
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const newPhotos = await Promise.all(
      files.map(async (file) => ({ name: file.name, data: await resizeImage(file) }))
    );
    setPhotos((list) => [...list, ...newPhotos]);
    if (isProject) return;
    setGpsReading(true);
    try {
      for (const file of files) {
        const gpsData = await exifr.gps(file).catch(() => null);
        if (gpsData?.latitude && gpsData?.longitude) {
          setGps({ lat: gpsData.latitude, lng: gpsData.longitude });
          break;
        }
      }
    } finally {
      setGpsReading(false);
    }
  }

  function removePhoto(index) {
    setPhotos((list) => list.filter((_, i) => i !== index));
  }

  async function handleAttachment(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const oversized = files.find((f) => f.size > 8 * 1024 * 1024);
    if (oversized) {
      setError(`"${oversized.name}" melebihi 8MB.`);
      return;
    }
    const newAttachments = await Promise.all(
      files.map(async (file) => ({ name: file.name, data: await readFileAsDataUrl(file) }))
    );
    setAttachments((list) => [...list, ...newAttachments]);
  }

  function removeAttachment(index) {
    setAttachments((list) => list.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isProject && leadIds.length === 0) {
      setError("Pilih minimal satu lead project untuk approval.");
      return;
    }
    setError("");
    onSubmit({
      title,
      description,
      priority,
      photo: photos.length > 0 ? JSON.stringify(photos) : "-",
      attachment: attachments.length > 0 ? JSON.stringify(attachments) : "-",
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
            {photos.length > 0 ? `${photos.length} foto dipilih` : "Upload foto"}
            <input type="file" accept="image/*" multiple onChange={handlePhoto} className="hidden" />
          </label>
          {photos.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="group relative">
                  <img
                    src={p.data}
                    alt={p.name}
                    className="h-20 w-full cursor-pointer rounded-lg object-cover"
                    onClick={() => openDataUrl(p.data)}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Hapus foto"
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
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
          {!isProject && !gpsReading && !gps && photos.length > 0 && (
            <p className="mt-2 text-xs font-semibold text-gray-400">Tidak ada data GPS di foto ini.</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Attachment</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-500 hover:border-navy hover:text-navy">
            <Paperclip className="h-4 w-4" />
            {attachments.length > 0 ? `${attachments.length} file dipilih` : "Upload file"}
            <input type="file" multiple onChange={handleAttachment} className="hidden" />
          </label>
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {attachments.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-md bg-navy/5 px-2.5 py-1 text-xs font-bold text-navy"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  <button
                    type="button"
                    onClick={() => openDataUrl(a.data)}
                    className="min-w-0 flex-1 truncate text-left hover:underline"
                  >
                    {a.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    aria-label="Hapus attachment"
                    className="shrink-0 text-navy/60 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isProject && (
        <div className="space-y-5 rounded-xl bg-gray-50 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={inputClass}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

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

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

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
