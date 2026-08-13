import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AddTask() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date) {
      setError("Semua field wajib diisi.");
      return;
    }
    setError("");
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

        <label className="mb-1 block text-sm font-bold text-gray-800">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-2 w-56 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-navy"
        />

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