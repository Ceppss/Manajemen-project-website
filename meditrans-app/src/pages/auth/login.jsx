import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Globe2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setError("");
    // TODO: sambungkan ke endpoint auth beneran di sini
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAEAEA] px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-300 bg-white pb-10 pt-16 shadow-sm">
        <div className="absolute left-1/2 top-0 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-navy text-white shadow-md">
          <Globe2 className="h-7 w-7" strokeWidth={1.5} />
          <span className="mt-1 text-[10px] font-extrabold tracking-wide">MEDITRANS</span>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xs flex-col gap-4 px-8">
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
            />
            <User className="h-5 w-5 shrink-0 text-gray-700" strokeWidth={1.5} />
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
            />
            <Lock className="h-5 w-5 shrink-0 text-gray-700" strokeWidth={1.5} />
          </label>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-[#3D7DBF] py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#336aa3]"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}