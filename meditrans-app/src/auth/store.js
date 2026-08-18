import { useSyncExternalStore } from "react";
import { api } from "./api";

const RESOURCES = ["users", "projects", "tasks", "reports", "dailyReports"];

const state = Object.fromEntries(RESOURCES.map((k) => [k, []]));
const listeners = new Set();
let loadPromise = null;

function emit() {
  listeners.forEach((l) => l());
}

function setResource(key, value) {
  state[key] = value;
  emit();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(key) {
  return useSyncExternalStore(subscribe, () => state[key]);
}

export function getStoreValue(key) {
  return state[key];
}

export function useMembers() {
  return useStore("users").filter((u) => u.role === "Member Project");
}

export function useLeads() {
  return useStore("users").filter((u) => u.role === "Lead Project");
}

export function loadAll() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      api("/users"),
      api("/projects"),
      api("/tasks"),
      api("/reports"),
      api("/daily-reports"),
    ])
      .then(([users, projects, tasks, reports, dailyReports]) => {
        setResource("users", users);
        setResource("projects", projects);
        setResource("tasks", tasks);
        setResource("reports", reports);
        setResource("dailyReports", dailyReports);
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

export async function createItem(resource, path, payload) {
  const created = await api(path, { method: "POST", body: JSON.stringify(payload) });
  setResource(resource, [...state[resource], created]);
  return created;
}

export async function updateItem(resource, path, payload) {
  const updated = await api(path, { method: "PUT", body: JSON.stringify(payload) });
  setResource(resource, state[resource].map((x) => (x.id === updated.id ? updated : x)));
  return updated;
}

export async function deleteItem(resource, path, id) {
  await api(path, { method: "DELETE" });
  setResource(resource, state[resource].filter((x) => x.id !== id));
}

// ---------- Overview segments (computed from real data) ----------

export function statusSegments(items, key = "status") {
  const counts = { "Not Started": 0, "On going": 0, Finished: 0, Overdue: 0 };
  items.forEach((it) => {
    const s = it[key];
    if (s in counts) counts[s]++;
  });
  const total = items.length || 1;
  return [
    { value: Math.round((counts["Not Started"] / total) * 100), color: "gray", label: "Not Started" },
    { value: Math.round((counts["On going"] / total) * 100), color: "amber", label: "On going" },
    { value: Math.round((counts.Finished / total) * 100), color: "emerald", label: "Finished" },
    { value: Math.round((counts.Overdue / total) * 100), color: "red", label: "Overdue" },
  ];
}

export function taskStatusSegments(tasks) {
  const counts = { "Not Started": 0, "On going": 0, Finished: 0, Overdue: 0 };
  tasks.forEach((t) => {
    if (t.dueColor === "overdue" && t.status !== "Finished") {
      counts.Overdue++;
    } else if (t.status in counts) {
      counts[t.status]++;
    }
  });
  const total = tasks.length || 1;
  return [
    { value: Math.round((counts["Not Started"] / total) * 100), color: "gray", label: "Not Started" },
    { value: Math.round((counts["On going"] / total) * 100), color: "amber", label: "On going" },
    { value: Math.round((counts.Finished / total) * 100), color: "emerald", label: "Finished" },
    { value: Math.round((counts.Overdue / total) * 100), color: "red", label: "Overdue" },
  ];
}

export function reportStatusSegments(reports) {
  const counts = { Review: 0, Approve: 0, Revision: 0 };
  reports.forEach((r) => {
    if (r.status in counts) counts[r.status]++;
  });
  const total = reports.length || 1;
  return [
    { value: Math.round((counts.Review / total) * 100), color: "amber", label: "Reviewed" },
    { value: Math.round((counts.Approve / total) * 100), color: "emerald", label: "Approved" },
    { value: Math.round((counts.Revision / total) * 100), color: "red", label: "Revision" },
  ];
}

// ---------- Due soon (computed from tasks) ----------

export function getDueSoon(tasks, limit = 4) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks
    .filter((t) => t.endDate)
    .map((t) => {
      const end = new Date(`${t.endDate}T00:00:00`);
      const days = Math.round((end - today) / (24 * 60 * 60 * 1000));
      return { id: t.id, title: t.title, days, color: days < 0 ? "overdue" : "ongoing" };
    })
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);
}
