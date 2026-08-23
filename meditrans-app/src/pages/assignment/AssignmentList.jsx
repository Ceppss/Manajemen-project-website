import { useNavigate } from "react-router-dom";
import DonutChart from "../../components/DonutChart";
import { useStore, taskStatusSegments, getDueSoon } from "../../auth/store";
import { getRole, canAssignTask } from "../../auth/role";
import { getUser } from "../../auth/api";
import { visibleTasksFor } from "../../auth/visibility";
import TaskBoard from "./TaskBoard";
import SubtaskBoard from "./SubtaskBoard";

const DUE_DOT = {
  overdue: "#EB5757",
  finished: "#2FBF71",
  ongoing: "#F5A623",
};

export default function AssignmentList() {
  const navigate = useNavigate();
  const tasks = useStore("tasks");
  const projects = useStore("projects");

  const role = getRole();
  const me = getUser();
  const myId = Number(me?.id);

  const visibleTasks = visibleTasksFor(role, myId, tasks, projects);
  const dueSoon = getDueSoon(visibleTasks);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy">Task</h2>
        </div>
        {canAssignTask(getRole()) && (
          <button
            onClick={() => navigate("/assignment/add-task")}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Add task
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-center text-base font-bold text-navy">Assignment Overview</h3>
          <div className="flex items-center justify-center gap-8">
            <DonutChart segments={taskStatusSegments(visibleTasks)} size={170} strokeWidth={20} />
            <ul className="space-y-2">
              {taskStatusSegments(visibleTasks).map((seg) => (
                <li key={seg.label} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span
                    className="h-3.5 w-3.5 rounded-sm"
                    style={{
                      backgroundColor: { gray: "#D9D9D9", amber: "#F5A623", emerald: "#2FBF71", red: "#EB5757" }[seg.color],
                    }}
                  />
                  {seg.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-base font-bold text-navy">Due Soon</h3>
          <ul className="space-y-3">
            {dueSoon.length === 0 && (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-center text-xs text-gray-400">
                Belum ada task dengan deadline.
              </p>
            )}
            {dueSoon.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/assignment/edit-task/${d.id}`)}
                className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
              >
                <span className="text-sm font-semibold text-gray-700">{d.title}</span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  {d.days < 0 ? "Overdue" : `${d.days} days`}
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DUE_DOT[d.color] }} />
                </span>
              </button>
            ))}
          </ul>
        </div>
      </div>

      <TaskBoard tasks={visibleTasks} />

      <div className="mt-8">
        <h3 className="mb-4 text-base font-bold text-navy">Subtask Board</h3>
        <SubtaskBoard tasks={visibleTasks} />
      </div>
    </div>
  );
}
