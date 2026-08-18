import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api } from "../../auth/api";

const ROLE_OPTIONS = ["Superadmin", "Lead Project", "Member Project"];

const ROLE_STYLE = {
  Superadmin: "bg-navy/10 text-navy",
  "Lead Project": "bg-amber-50 text-amber-600",
  "Member Project": "bg-emerald-50 text-emerald-600",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-navy";

const EMPTY_FORM = { name: "", email: "", role: "Member Project", password: "" };

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadEmployees() {
    const data = await api("/users");
    setEmployees(data);
    setError("");
  }

  useEffect(() => {
    let cancelled = false;
    api("/users")
      .then((data) => {
        if (!cancelled) setEmployees(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.email.toLowerCase().includes(query.toLowerCase())
      ),
    [query, employees]
  );

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(emp) {
    setEditingId(emp.id);
    setForm({ name: emp.name, email: emp.email, role: emp.role, password: "" });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim() || (!editingId && !form.password)) {
      return;
    }
    try {
      if (editingId) {
        await api(`/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            password: form.password || undefined,
          }),
        });
      } else {
        await api("/users", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            password: form.password,
          }),
        });
      }
      setShowModal(false);
      setError("");
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api(`/users/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setError("");
      await loadEmployees();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy">Admin - Karyawan</h2>
          <p className="mt-0.5 text-sm text-gray-400">Data karyawan perusahaan beserta role dan kontaknya.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          <Plus className="h-4 w-4" />
          Add Karyawan
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card sm:w-80">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Karyawan"
          className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Nama</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  Memuat data...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  Tidak ada karyawan yang cocok.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-5 py-3 font-semibold text-gray-800">{e.name}</td>
                  <td className="px-5 py-3 text-gray-500">{e.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-md px-3 py-1 text-xs font-bold ${ROLE_STYLE[e.role]}`}>
                      {e.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(e)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(e)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-navy">{editingId ? "Edit Karyawan" : "Add Karyawan"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nama</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama lengkap"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Password {editingId && <span className="font-normal text-gray-400">(kosongkan jika tidak ganti)</span>}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingId ? "••••••" : "Password"}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@meditrans.co.id"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputClass}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!form.name.trim() || !form.email.trim() || (!editingId && !form.password)}
                  className="flex-1 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-5 text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Trash2 className="h-5 w-5" />
              </span>
              <h2 className="text-base font-bold text-navy">Hapus Akun</h2>
              <p className="mt-1 text-sm text-gray-500">
                Yakin ingin menghapus akun <span className="font-semibold text-gray-700">{deleteTarget.name}</span> (
                {deleteTarget.email})? Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
