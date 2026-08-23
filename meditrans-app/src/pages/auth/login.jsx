import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { api, setToken, setUser } from "../../auth/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAEAEA] px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-300 bg-white pb-10 pt-16 shadow-sm">
        <div className="absolute left-1/2 top-0 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-navy shadow-md ring-4 ring-white">
          <img src="/logo.png" alt="Meditrans" className="h-full w-full object-cover" />
        </div>

        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xs flex-col gap-4 px-8">
          <h1 className="text-center text-lg font-extrabold tracking-wide text-navy">
            SELAMAT DATANG
          </h1>
          <p className="-mt-2 text-center text-xs text-gray-400">
            Masuk dengan akun yang terdaftar
          </p>

          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
            />
            <Mail className="h-5 w-5 shrink-0 text-gray-700" strokeWidth={1.5} />
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
            disabled={loading}
            className="mt-2 rounded-lg bg-navy py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
