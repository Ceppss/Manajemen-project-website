const BASE = "/api";
const TOKEN_KEY = "meditrans_token";
const USER_KEY = "meditrans_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---------- Local profile (name + photo, per account) ----------

export function getProfile(userId) {
  try {
    return JSON.parse(localStorage.getItem(`meditrans_profile_${userId}`)) || null;
  } catch {
    return null;
  }
}

export function setProfile(userId, profile) {
  localStorage.setItem(`meditrans_profile_${userId}`, JSON.stringify(profile));
}

export async function updateProfile(payload) {
  return api("/auth/profile", { method: "PUT", body: JSON.stringify(payload) });
}

// ---------- Notifications ----------

export async function getNotifications() {
  return api("/notifications");
}

export async function markNotificationRead(id) {
  return api(`/notifications/${id}/read`, { method: "PUT" });
}

export async function markAllNotificationsRead() {
  return api("/notifications/read-all", { method: "PUT" });
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Request gagal");
  }
  return data;
}
