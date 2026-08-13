import { useState } from "react";
import { X, User, Lock } from "lucide-react";
import { currentUser } from "../data/mockData";

export default function ProfileModal({ onClose }) {
  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department);
  const [zone, setZone] = useState(currentUser.zone);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSaved(false);

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError("Masukkan password saat ini untuk mengubah password.");
        return;
      }
      if (newPassword.length > 0 && newPassword.length < 8) {
        setError("Password baru minimal 8 karakter.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Konfirmasi password baru tidak cocok.");
        return;
      }
    }

    setError("");
    // TODO: send { name, department, zone, currentPassword, newPassword } to the API here
    setSaved(true);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-navy">Profile Management</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt={name} className="h-14 w-14 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-navy">{name}</p>
              <p className="text-xs text-gray-400">{currentUser.role}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              <User className="h-3.5 w-3.5" /> Identity
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Department</label>
                <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Zone</label>
                <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy" />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              <Lock className="h-3.5 w-3.5" /> Change password
            </p>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy" />
              <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy" />
              <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy" />
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
          {saved && !error && <p className="text-xs font-medium text-emerald-600">Perubahan tersimpan.</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy-dark">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}