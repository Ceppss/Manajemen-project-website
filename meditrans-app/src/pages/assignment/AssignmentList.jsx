import { useNavigate } from "react-router-dom";
import Tabs from "../../components/Tabs";
import DonutChart from "../../components/DonutChart";
import { tasks, dueSoon, overviewDonuts, members } from "../../data/mockData";

const DUE_DOT = {
  overdue: "#EB5757",
  finished: "#2FBF71",
  ongoing: "#F5A623",
};

const COLUMNS = [
  { key: "Not Started", label: "To do List" },
  { key: "On going", label: "on going" },
  { key: "Finished", label: "Finished" },
];

function assigneeNames(ids) {
  return ids.map((id) => members.find((m) => m.id === id)?.name || id).join(", ");
}

export default function AssignmentList() {
  const navigate = useNavigate();

  return (
    <div>
      <Tabs tabs={[{ label: "Project", to: "/project" }, { label: "Assignment", to: "/assignment" }]} />

      <button
        onClick={() => navigate("/assignment/add-task")}
        className="mb-6 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
      >
        Add task
      </button>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-center text-base font-bold text-navy">Assignment Overview</h3>
          <div className="flex items-center justify-center gap-8">
            <DonutChart segments={overviewDonuts.assignment} size={170} strokeWidth={20} />
            <ul className="space-y-2">
              {overviewDonuts.assignment.map((seg) => (
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
            {dueSoon.map((d) => (
              <li key={d.title} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">{d.title}</span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  {d.days} days
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DUE_DOT[d.color] }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-2xl border border-navy/20 bg-white p-5 shadow-card">
              <h3 className="mb-4 text-center text-sm font-bold text-navy">{col.label}</h3>
              <div className="max-h-[420px] space-y-3 overflow-y-auto">
                {items.length === 0 && <p className="text-center text-xs text-gray-400">Belum ada task.</p>}
                {items.map((t) => (
                  <div key={t.id} className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm font-extrabold text-gray-800">TASK #{t.id.replace(/\D/g, "")}</p>
                    <p className="mt-1 text-xs text-gray-500">{t.description}</p>
                    <p className="mt-1 text-[11px] text-gray-400">Assignee: {assigneeNames(t.assignees)}</p>
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
    </div>
  );
}