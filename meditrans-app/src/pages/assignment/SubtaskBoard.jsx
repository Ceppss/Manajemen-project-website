import { useNavigate } from "react-router-dom";
import { useStore } from "../../auth/store";
import { getRole, isAdmin, isLead } from "../../auth/role";
import { getUser } from "../../auth/api";

const COLUMNS = [
  { key: "Not Started", label: "To do List" },
  { key: "On going", label: "on going" },
  { key: "Finished", label: "Finished" },
];

export default function SubtaskBoard({ tasks }) {
  const navigate = useNavigate();
  const users = useStore("users");

  const role = getRole();
  const myId = Number(getUser()?.id);

  const subtasks = tasks.flatMap((t) =>
    (t.subtasks || []).map((s) => ({ ...s, taskId: t.id, taskTitle: t.title }))
  );

  const visibleSubtasks = isAdmin(role) || isLead(role)
    ? subtasks
    : subtasks.filter((s) => Number(s.assigneeId) === myId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = visibleSubtasks.filter((s) => s.status === col.key);
        return (
          <div key={col.key} className="rounded-2xl border border-navy/20 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-center text-sm font-bold text-navy">{col.label}</h3>
            <div className="max-h-[420px] space-y-3 overflow-y-auto">
              {items.length === 0 && <p className="text-center text-xs text-gray-400">Belum ada subtask.</p>}
              {items.map((s) => (
                <div key={s.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-extrabold text-gray-800">{s.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-navy/70">Task: {s.taskTitle}</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Assignee: {s.assigneeId ? users.find((u) => u.id === Number(s.assigneeId))?.name || "-" : "Belum diassign"}
                  </p>
                  <button
                    onClick={() => navigate(`/assignment/subtask/${s.taskId}/${s.id}`)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View Subtask
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
