import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReportForm from "./ReportForm";
import { logAudit } from "../../auth/audit";
import { useStore, createItem } from "../../auth/store";
import { getRole, canSeeDailyReport } from "../../auth/role";

export default function AddReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isProject = searchParams.get("type") === "project";
  const tasks = useStore("tasks");
  const projects = useStore("projects");

  if (!isProject && !canSeeDailyReport(getRole())) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
        Daily report hanya bisa dibuat oleh member dan lead project.
      </div>
    );
  }

  const taskIdParam = searchParams.get("task");
  const subtaskIdParam = searchParams.get("subtask");
  const prefilledTask = taskIdParam ? tasks.find((t) => t.id === taskIdParam) : null;
  const prefilledProject = prefilledTask
    ? projects.find((p) => p.id === prefilledTask.projectId)
    : null;
  const initial = prefilledTask
    ? { title: "", description: "", project: prefilledProject?.name || "", task: prefilledTask.title }
    : null;

  async function handleSubmit(data) {
    const record = {
      title: data.title,
      description: data.description,
      photo: data.photo,
      attachment: data.attachment,
      status: "Review",
    };

    if (isProject) {
      const project = projects.find((p) => p.id === data.projectId);
      const task = tasks.find((t) => t.id === data.taskId);
      const subtask = subtaskIdParam
        ? task?.subtasks?.find((s) => s.id === subtaskIdParam)
        : null;
      await createItem("reports", "/reports", {
        ...record,
        priority: data.priority || "Middle",
        project: project?.name || "-",
        task: task?.title || "-",
        subtask: subtask?.title,
        subtaskId: subtask?.id,
        approvalBy: data.leadIds,
      });
      logAudit("Submit Report", `${data.title} (project report ${project?.name || "-"})`);
      if (taskIdParam && subtaskIdParam) {
        navigate(`/assignment/subtask/${taskIdParam}/${subtaskIdParam}`);
      } else if (taskIdParam) {
        navigate(`/assignment/edit-task/${taskIdParam}`);
      } else {
        navigate("/report/project");
      }
    } else {
      await createItem("dailyReports", "/daily-reports", {
        ...record,
        date: new Date().toISOString().slice(0, 10),
        activity: data.title,
        gps: data.gps || null,
      });
      logAudit("Submit Report", `${data.title} (daily report)`);
      navigate("/report/daily");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={isProject ? "/report/project" : "/report/daily"}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {isProject ? "Project Report" : "Daily Report"}
      </Link>

      <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
        <h3 className="mb-6 text-lg font-bold text-navy">
          {isProject ? "Bikin Project Report" : "Bikin Daily Report"}
        </h3>
        <ReportForm
          isProject={isProject}
          initial={initial}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
