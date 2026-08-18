import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImagePlus,
  MapPin,
  Paperclip,
  Send,
  ThumbsUp,
  Undo2,
} from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { getRole, isLead, canSubmitReport } from "../../auth/role";
import { logAudit } from "../../auth/audit";
import { useStore, updateItem } from "../../auth/store";

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  return <ReportDetailInner key={id} id={id} />;
}

function ReportDetailInner({ id }) {
  const navigate = useNavigate();
  const reports = useStore("reports");
  const dailyReports = useStore("dailyReports");
  const tasks = useStore("tasks");
  const projects = useStore("projects");
  const users = useStore("users");

  const found = reports.find((r) => r.id === id) || dailyReports.find((r) => r.id === id);
  const isProject = reports.some((r) => r.id === id);
  const role = getRole();
  const canReview = isLead(role);
  const canSubmit = canSubmitReport(role);
  const [report, setReport] = useState(found);
  const [revisionMode, setRevisionMode] = useState(false);
  const [notes, setNotes] = useState("");

  if (!report) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
        Report tidak ditemukan.
      </div>
    );
  }

  const linkedTask = report.task ? null : tasks.find((t) => t.title === report.title);
  const projectName =
    report.project || (linkedTask ? projects.find((p) => p.id === linkedTask.projectId)?.name : null) || "-";
  const taskName = report.task || linkedTask?.title || "-";
  const approvalNames = (report.approvalBy || [])
    .map((uid) => users.find((u) => u.id === uid)?.name)
    .filter(Boolean);

  async function updateReport(patch) {
    const path = isProject ? `/reports/${id}` : `/daily-reports/${id}`;
    const updated = await updateItem(isProject ? "reports" : "dailyReports", path, {
      ...report,
      ...patch,
    });
    setReport(updated);
  }

  async function handleApprove() {
    await updateReport({ status: "Approve", notes: undefined });
    setRevisionMode(false);
    logAudit("Approve Report", `${report.title} disetujui`);
  }

  async function handleSendRevision() {
    if (!notes.trim()) return;
    await updateReport({ status: "Revision", notes: notes.trim() });
    setRevisionMode(false);
    setNotes("");
    logAudit("Needs Revision", `${report.title} dikembalikan: ${notes.trim()}`);
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
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-navy">{report.title}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {isProject ? "Project Report" : "Daily Report"}
            </p>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!isProject && <InfoRow label="Date" value={report.date || "-"} />}
          {isProject && (
            <>
              <InfoRow label="Project" value={projectName} />
              <InfoRow label="Task" value={taskName} />
            </>
          )}
          <InfoRow label="Status" value={report.status} />
          {!isProject && report.gps?.lat && report.gps?.lng && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Lokasi (GPS)</p>
              <a
                href={`https://www.google.com/maps?q=${report.gps.lat},${report.gps.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" />
                {report.gps.lat.toFixed(5)}, {report.gps.lng.toFixed(5)} — Buka Maps
              </a>
            </div>
          )}
          {isProject && approvalNames.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Approval from</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {approvalNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700"
                  >
                    <CheckCircle2 className="h-3 w-3 text-status-finished" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-5 rounded-xl bg-gray-50 p-5">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <FileText className="h-3.5 w-3.5" />
            Deskripsi
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{report.description}</p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <ImagePlus className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Foto</p>
              <p className="truncate text-sm font-semibold text-gray-800">
                {report.photo && report.photo !== "-" ? report.photo : "Tidak ada foto"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Attachment</p>
              <p className="truncate text-sm font-semibold text-gray-800">
                {report.attachment && report.attachment !== "-" ? report.attachment : "Tidak ada attachment"}
              </p>
            </div>
          </div>
        </div>

        {isProject && report.status === "Revision" && canSubmit && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5">
            {report.notes && (
              <>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-500">
                  <Undo2 className="h-3.5 w-3.5" />
                  Catatan Revisi
                </p>
                <p className="mb-4 text-sm leading-relaxed text-red-700">{report.notes}</p>
              </>
            )}
            <button
              type="button"
              onClick={() => navigate(`/report/edit/${report.id}`)}
              className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              <Send className="h-4 w-4" />
              Resubmit Report
            </button>
          </div>
        )}

        {isProject && report.status === "Approve" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            Laporan ini sudah di-approve oleh lead project.
          </div>
        )}

        {isProject && report.status === "Review" && canReview && (
          <div className="rounded-xl border border-gray-200 p-5">
            <h4 className="mb-1 text-sm font-bold text-navy">Review Report</h4>
            <p className="mb-4 text-xs text-gray-400">
              Approve laporan ini, atau kembalikan ke member project untuk revisi.
            </p>

            {revisionMode ? (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan revisi untuk member project..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-navy"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRevisionMode(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRevision}
                    disabled={!notes.trim()}
                    className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send for Revision
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex items-center gap-2 rounded-lg bg-status-finished px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setRevisionMode(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Undo2 className="h-4 w-4" />
                  Needs Revision
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
