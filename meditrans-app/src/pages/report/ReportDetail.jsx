import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  ImagePlus,
  MapPin,
  Paperclip,
  Send,
  ThumbsUp,
  Undo2,
  X,
} from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { getRole, isLead, canSeeDailyReport } from "../../auth/role";
import { getUser } from "../../auth/api";
import { useStore, updateItem } from "../../auth/store";
import { parseMediaList, openDataUrl } from "../../auth/media";

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
  const [report, setReport] = useState(found);
  const [revisionMode, setRevisionMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [lightbox, setLightbox] = useState(null);

  if (!isProject && !canSeeDailyReport(role)) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
        Daily report hanya bisa dilihat oleh member dan lead project.
      </div>
    );
  }

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
  const submitter = users.find((u) => u.id === report.createdBy)?.name || "-";
  const currentUserId = getUser()?.id;
  const isOwner = report.createdBy === currentUserId;
  // Project reports pick specific leads as approvers at submission time; daily reports
  // require every current lead (other than the submitter) to sign off.
  const requiredApproverIds = isProject
    ? report.approvalBy || []
    : users.filter((u) => u.role === "Lead Project" && u.id !== report.createdBy).map((u) => u.id);
  const requiredApprovals = requiredApproverIds.length;
  const grantedApprovals = (report.approvedBy || []).filter((uid) => requiredApproverIds.includes(uid)).length;
  const alreadyApproved = (report.approvedBy || []).includes(currentUserId);
  const canReviewThis = isLead(role) && !isOwner;
  const photoList = parseMediaList(report.photo);
  const attachmentList = parseMediaList(report.attachment);
  const isViewable = (media) => /^data:(image\/|application\/pdf|text\/)/.test(media.data);

  async function updateReport(patch) {
    const path = isProject ? `/reports/${id}` : `/daily-reports/${id}`;
    const updated = await updateItem(isProject ? "reports" : "dailyReports", path, {
      ...report,
      ...patch,
    });
    setReport(updated);
  }

  async function handleApprove() {
    await updateReport({ approval: { action: "approve" } });
    setRevisionMode(false);
  }

  async function handleSendRevision() {
    if (!notes.trim()) return;
    await updateReport({ approval: { action: "revision", notes: notes.trim() } });
    setRevisionMode(false);
    setNotes("");
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
          <InfoRow label="Submitted by" value={submitter} />
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
          {requiredApproverIds.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Approval progress ({grantedApprovals}/{requiredApprovals})
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {requiredApproverIds.map((uid) => {
                  const name = users.find((u) => u.id === uid)?.name || `Lead #${uid}`;
                  const done = (report.approvedBy || []).includes(uid);
                  return (
                    <span
                      key={uid}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        done ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <CheckCircle2 className={`h-3 w-3 ${done ? "text-status-finished" : "text-gray-300"}`} />
                      {name}
                      {done && " ✓"}
                    </span>
                  );
                })}
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
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Foto {photoList.length > 0 && `(${photoList.length})`}
              </p>
              {photoList.length > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {photoList.map((p, i) => (
                    <img
                      key={i}
                      src={p.data}
                      alt={p.name}
                      className="h-20 w-full cursor-pointer rounded-lg object-cover"
                      onClick={() => setLightbox(p.data)}
                    />
                  ))}
                </div>
              ) : (
                <p className="truncate text-sm font-semibold text-gray-800">Tidak ada foto</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Attachment {attachmentList.length > 0 && `(${attachmentList.length})`}
              </p>
              {attachmentList.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {attachmentList.map((a, i) =>
                    isViewable(a) ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openDataUrl(a.data)}
                        className="flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-navy hover:underline"
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{a.name} — Buka file</span>
                      </button>
                    ) : (
                      <a
                        key={i}
                        href={a.data}
                        download={a.name}
                        className="flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-navy hover:underline"
                      >
                        <Download className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{a.name} — Unduh file</span>
                      </a>
                    )
                  )}
                </div>
              ) : (
                <p className="truncate text-sm font-semibold text-gray-800">Tidak ada attachment</p>
              )}
            </div>
          </div>
        </div>

        {report.status === "Revision" && isOwner && (
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

        {report.status === "Approve" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            Laporan ini sudah di-approve oleh {isProject ? "lead project" : "semua lead project"}.
          </div>
        )}

        {report.status === "Review" && !isProject && isOwner && requiredApproverIds.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            Belum ada lead project lain yang bisa approve laporan ini. Laporan akan tetap "Review" sampai ada lead
            lain di sistem.
          </div>
        )}

        {report.status === "Review" && canReviewThis && (
          <div className="rounded-xl border border-gray-200 p-5">
            <h4 className="mb-1 text-sm font-bold text-navy">Review Report</h4>
            <p className="mb-4 text-xs text-gray-400">
              Approve laporan ini, atau kembalikan untuk revisi.
            </p>

            {alreadyApproved ? (
              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Anda sudah approve laporan ini. Menunggu approval lead project lain
                ({grantedApprovals}/{requiredApprovals}).
              </p>
            ) : revisionMode ? (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan revisi untuk pembuat laporan..."
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
                  {requiredApprovals > 1 ? "Approve (lanjut lead berikutnya)" : "Approve"}
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

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Foto report"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
