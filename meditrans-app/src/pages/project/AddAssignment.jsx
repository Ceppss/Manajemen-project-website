import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, ChevronDown } from "lucide-react";
import { members } from "../../data/mockData";

export default function AddAssignment() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || assignees.length === 0) {
      setError("Semua field wajib diisi, termasuk minimal satu assignee.");
      return;
    }
    setError("");
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
            <label className="mb-1 block text-sm font-bold text-gray-800">Assign too</label>
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

            <div className="mt-3 space-y-2">
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