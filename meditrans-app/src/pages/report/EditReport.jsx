import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Undo2 } from "lucide-react";
import ReportForm from "./ReportForm";
import { logAudit } from "../../auth/audit";
import { useStore, updateItem } from "../../auth/store";
import { getRole, canSeeDailyReport } from "../../auth/role";

export default function EditReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const reports = useStore("reports");
  const dailyReports = useStore("dailyReports");
  const tasks = useStore("tasks");
  const projects = useStore("projects");

  const isProject = reports.some((r) => r.id === id);
  const list = isProject ? reports : dailyReports;
  const report = list.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
        Report tidak ditemukan.
      </div>
    );
  }

  if (!isProject && !canSeeDailyReport(getRole())) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
        Daily report hanya bisa dilihat oleh member dan lead project.
      </div>
    );
  }

  async function handleSubmit(data) {
    const project = projects.find((p) => p.id === data.projectId);
    const task = tasks.find((t) => t.id === data.taskId);
    const base = {
      title: data.title,
      description: data.description,
      photo: data.photo,
      attachment: data.attachment,
      status: "Review",
      notes: undefined,
    };
    if (isProject) {
      await updateItem("reports", `/reports/${id}`, {
        ...base,
        priority: data.priority || "Middle",
        project: project?.name || "-",
        task: task?.title || "-",
        subtask: report.subtask,
        subtaskId: report.subtaskId,
        approvalBy: data.leadIds,
      });
    } else {
      await updateItem("dailyReports", `/daily-reports/${id}`, {
        ...base,
        date: report.date,
        activity: data.title,
        gps: data.gps || report.gps || null,
      });
    }
    logAudit("Resubmit Report", `${data.title} disubmit ulang untuk review`);
    navigate(`/report/detail/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={`/report/detail/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Report Detail
      </Link>

      <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
        <h3 className="mb-6 text-lg font-bold text-navy">
          {isProject ? "Resubmit Project Report" : "Resubmit Daily Report"}
        </h3>

        {isProject && report.status === "Revision" && report.notes && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-500">
              <Undo2 className="h-3.5 w-3.5" />
              Catatan Revisi
            </p>
            <p className="text-sm leading-relaxed text-red-700">{report.notes}</p>
          </div>
        )}

        <ReportForm
          isProject={isProject}
          initial={report}
          submitLabel="Resubmit Report"
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
