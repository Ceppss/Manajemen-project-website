import { getUser } from "./api";

export const VALID_ROLES = ["Superadmin", "Lead Project", "Member Project"];

export function getRole() {
  const role = getUser()?.role;
  return VALID_ROLES.includes(role) ? role : "Superadmin";
}

export function isLead(role) {
  return role === "Lead Project";
}

export function isAdmin(role) {
  return role === "Superadmin";
}

export function canSubmitReport(role) {
  return role === "Member Project";
}

export function canSeeDailyReport(role) {
  return role === "Member Project" || role === "Lead Project";
}

export function canManageProject(role) {
  return role === "Lead Project";
}

export function canAssignTask(role) {
  return role === "Lead Project" || role === "Member Project";
}

export function assignableRoles(role) {
  return role === "Lead Project" ? ["Lead Project", "Member Project"] : ["Member Project"];
}
