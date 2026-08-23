import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, UserCog } from "lucide-react";
import { logAudit } from "../../auth/audit";
import { useLeads, useStore, createItem } from "../../auth/store";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-navy";

export default function AdminProject() {
  const navigate = useNavigate();
  const projects = useStore("projects");
  const leads = useLeads();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [pjId, setPjId] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !pjId) return;
    await createItem("projects", "/projects", {
      name: name.trim(),
      description: description.trim(),
      startDate: startDate || "",
      deadline: deadline || "-",
      pjId,
    });
    const pj = leads.find((l) => l.id === Number(pjId));
    setName("");
    setDescription("");
    setStartDate("");
    setDeadline("");
    setPjId("");
    logAudit("Create Project", `${name.trim()} dibuat dengan PJ ${pj?.name || "-"}`);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy">Project</h2>
        
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-navy">
            <FolderPlus className="h-4 w-4" />
            Bikin Project
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nama Project</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: RS Gatot Subroto"
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
                placeholder="Deskripsi project"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Lead Project</label>
              {leads.length === 0 ? (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Belum ada lead project. Tambahkan akun dengan role Lead Project dulu di menu{" "}
                  <button type="button" onClick={() => navigate("/admin/employees")} className="font-semibold underline">
                    Karyawan
                  </button>
                  .
                </p>
              ) : (
                <select required value={pjId} onChange={(e) => setPjId(e.target.value)} className={inputClass}>
                  <option value="" disabled>
                    Pilih lead project
                  </option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}

            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
              >
                Buat Project
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-navy">
            <UserCog className="h-4 w-4" />
            Daftar Project
          </h3>
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {projects.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">Belum ada project.</p>
            )}
            {projects.map((p) => {
              const pj = leads.find((l) => l.id === p.pjId);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-800">{p.name}</p>
                    <p className="truncate text-xs text-gray-400">{p.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">PJ</p>
                    <p className="text-xs font-semibold text-navy">{pj?.name || "-"}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/project/${p.id}`)}
                    className="shrink-0 rounded-lg border border-navy/30 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/5"
                  >
                    Open
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
