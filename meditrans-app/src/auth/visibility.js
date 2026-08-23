import { isAdmin } from "./role";

function memberProjectIds(projects, myId) {
  return projects
    .filter((p) => {
      const ids = [p.pjId, ...(p.leadIds || []), ...(p.memberIds || [])].map(Number);
      return ids.includes(myId);
    })
    .map((p) => p.id);
}

function handledProjectIds(projects, myId) {
  return projects
    .filter((p) => Number(p.pjId) === myId || (p.leadIds || []).map(Number).includes(myId))
    .map((p) => p.id);
}

export function visibleProjectsFor(role, myId, projects) {
  if (isAdmin(role)) return projects;
  const ids = memberProjectIds(projects, myId);
  return projects.filter((p) => ids.includes(p.id));
}

export function visibleTasksFor(role, myId, tasks, projects) {
  if (isAdmin(role)) return tasks;
  if (role === "Lead Project") {
    const ids = handledProjectIds(projects, myId);
    return tasks.filter((t) => t.projectId && ids.includes(t.projectId));
  }
  return tasks.filter((t) => (t.assignees || []).map(Number).includes(myId));
}
