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

export function canManageProject(role) {
  return role === "Lead Project";
}
