import { useNavigate } from "react-router-dom";
import { useStore } from "../../auth/store";
import { isTaskOverdue } from "../../auth/store";

const COLUMNS = [
  { key: "Not Started", label: "To do List" },
  { key: "On going", label: "on going" },
  { key: "Finished", label: "Finished" },
];

export default function TaskBoard({ tasks }) {
  const navigate = useNavigate();
  const users = useStore("users");

  function assigneeNames(ids) {
    return ids.map((id) => users.find((u) => u.id === Number(id))?.name || id).join(", ");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="rounded-2xl border border-navy/20 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-center text-sm font-bold text-navy">{col.label}</h3>
            <div className="max-h-[420px] space-y-3 overflow-y-auto">
              {items.length === 0 && <p className="text-center text-xs text-gray-400">Belum ada task.</p>}
              {items.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-lg border p-4 ${isTaskOverdue(t) ? "border-red-200 bg-red-50/40" : "border-gray-200"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-extrabold text-gray-800">{t.title}</p>
                    {isTaskOverdue(t) && (
                      <span className="shrink-0 rounded-md border border-red-300 bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{t.description}</p>
                  <p className="mt-1 text-[11px] text-gray-400">Assignee: {assigneeNames(t.assignees)}</p>
                  {t.endDate && (
                    <p className={`mt-0.5 text-[11px] font-semibold ${isTaskOverdue(t) ? "text-red-600" : "text-gray-400"}`}>
                      Deadline: {t.endDate}
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/assignment/edit-task/${t.id}`)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View Task
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
