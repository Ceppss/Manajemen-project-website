import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, Search, Users } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { useStore, isProjectOverdue } from "../../auth/store";
import { getRole } from "../../auth/role";
import { getUser } from "../../auth/api";
import { visibleProjectsFor } from "../../auth/visibility";

export default function ProjectList() {
  const navigate = useNavigate();
  const projects = useStore("projects");
  const users = useStore("users");
  const [query, setQuery] = useState("");

  const me = getUser();
  const myId = Number(me?.id);
  const visibleProjects = visibleProjectsFor(getRole(), myId, projects);

  function memberName(id) {
    return users.find((u) => u.id === Number(id))?.name || id;
  }

  const filtered = useMemo(
    () =>
      visibleProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      ),
    [query, visibleProjects]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Projects</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card sm:w-72">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Project"
            className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
          Tidak ada project yang cocok dengan pencarian.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/project/${p.id}`)}
            className={`flex flex-col rounded-2xl border bg-white p-6 text-left shadow-card transition-transform hover:-translate-y-0.5 ${
              isProjectOverdue(p) ? "border-red-300 bg-red-50/30" : "border-navy/20 hover:border-navy/40"
            }`}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-navy">{p.name}</h3>
              <div className="flex shrink-0 items-center gap-2">
                {isProjectOverdue(p) && (
                  <span className="rounded-md border border-red-300 bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    Overdue
                  </span>
                )}
                <StatusBadge status={p.status} />
              </div>
            </div>
            <p className="mb-5 line-clamp-2 text-sm text-gray-500">{p.description}</p>

            <div className="mt-auto space-y-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-500">Progress</span>
                  <span className="font-bold text-gray-700">{p.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${p.progress === 100 ? "bg-status-finished" : "bg-status-ongoing"}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {p.memberIds.map((id) => (
                      <span
                        key={id}
                        title={memberName(id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-navy text-[10px] font-bold text-white"
                      >
                        {memberName(id)[0]}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {p.memberIds.length}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-finished" />
                  {p.doneTasks}/{p.totalTasks}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {p.deadline}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
