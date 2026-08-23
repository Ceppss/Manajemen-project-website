import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  FileWarning,
  FolderKanban,
  PlayCircle,
  Truck,
} from "lucide-react";
import DonutChart from "../../components/DonutChart";
import { useStore, statusSegments, taskStatusSegments, getDueSoon, isTaskOverdue } from "../../auth/store";
import { getRole, isAdmin, isLead, canSubmitReport } from "../../auth/role";
import { getUser } from "../../auth/api";
import { visibleProjectsFor, visibleTasksFor } from "../../auth/visibility";
const LEGEND_COLORS = { gray: "#D9D9D9", amber: "#F5A623", emerald: "#2FBF71", red: "#EB5757" };
const DUE_DOT = { overdue: "#EB5757", finished: "#2FBF71", ongoing: "#F5A623" };

function OverviewDonut({ title, segments }) {
  return (
    <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
      <h3 className="mb-4 text-center text-base font-bold text-navy">{title}</h3>
      <div className="flex items-center justify-center gap-8">
        <DonutChart segments={segments} size={170} strokeWidth={20} />
        <ul className="space-y-2">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: LEGEND_COLORS[seg.color] }} />
              {seg.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function OverviewView() {
  const navigate = useNavigate();
  const projects = useStore("projects");
  const tasks = useStore("tasks");
  const reports = useStore("reports");

  const role = getRole();
  const me = getUser();
  const myId = Number(me?.id);
  const myName = me?.name || "-";

  const visibleProjects = visibleProjectsFor(role, myId, projects);
  const visibleTasks = visibleTasksFor(role, myId, tasks, projects);

  const allSubtasks = visibleTasks.flatMap((t) => (t.subtasks || []).map((s) => ({ ...s, taskId: t.id })));
  const visibleSubtasks = isAdmin(role) || isLead(role)
    ? allSubtasks
    : allSubtasks.filter((s) => Number(s.assigneeId) === myId);
  const taskUnits = [...visibleTasks, ...visibleSubtasks];

  const roleKpi = isLead(role)
    ? {
        label: "Reports to Approve",
        value: reports.filter((r) => r.status === "Review").length,
        icon: FileCheck2,
        iconClass: "bg-emerald-50 text-emerald-600",
      }
    : canSubmitReport(role)
      ? {
          label: "Files Need Revision",
          value: reports.filter((r) => r.status === "Revision").length,
          icon: FileWarning,
          iconClass: "bg-red-50 text-red-500",
        }
      : null;

  const kpis = [
    ...(roleKpi ? [roleKpi] : []),
    { label: "Total Projects", value: visibleProjects.length, icon: FolderKanban, iconClass: "bg-navy/10 text-navy" },
    {
      label: "Total Tasks",
      value: taskUnits.filter((t) => t.status !== "Finished").length,
      icon: ClipboardList,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "On Going",
      value: taskUnits.filter((t) => t.status === "On going").length,
      icon: PlayCircle,
      iconClass: "bg-amber-50 text-amber-500",
    },
    {
      label: "Overdue",
      value: visibleTasks.filter(isTaskOverdue).length,
      icon: AlertTriangle,
      iconClass: "bg-red-50 text-red-500",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy">Good morning, {myName}</h2>
        <p className="mt-1 text-sm text-gray-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className={`mb-6 grid grid-cols-2 gap-6 ${roleKpi ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
        {kpis.map((k) => (
          <div key={k.label} className="flex items-center gap-4 rounded-2xl border border-navy/20 bg-white p-5 shadow-card">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${k.iconClass}`}>
              <k.icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-navy">{k.value}</p>
              <p className="text-xs font-semibold text-gray-400">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewDonut title="Project Overview" segments={statusSegments(visibleProjects)} />
        <OverviewDonut title="Assignment Overview" segments={taskStatusSegments(taskUnits.filter((t) => t.status !== "Finished"))} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-navy">Due Soon</h3>
            <button
              onClick={() => navigate("/assignment")}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              See all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="space-y-3">
            {getDueSoon(visibleTasks).length === 0 && (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-center text-xs text-gray-400">
                Belum ada task dengan deadline.
              </p>
            )}
            {getDueSoon(visibleTasks).map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => navigate(`/assignment/edit-task/${d.id}`)}
                  className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                >
                  <span className="text-sm font-semibold text-gray-700">{d.title}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    {d.days < 0 ? "Overdue" : `${d.days} days`}
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DUE_DOT[d.color] }} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
          <h3 className="mb-4 text-base font-bold text-navy">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => navigate("/assignment/add-task")}
              className="flex items-center gap-3 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              <Truck className="h-4 w-4" /> Add Task
            </button>
            <button
              onClick={() => navigate("/project")}
              className="flex items-center gap-3 rounded-lg border border-navy/30 px-4 py-3 text-sm font-semibold text-navy hover:bg-navy/5"
            >
              <FolderKanban className="h-4 w-4" /> View Projects
            </button>
            <button
              onClick={() => navigate("/dashboard/calendar")}
              className="flex items-center gap-3 rounded-lg border border-navy/30 px-4 py-3 text-sm font-semibold text-navy hover:bg-navy/5"
            >
              <CalendarDays className="h-4 w-4" /> View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
