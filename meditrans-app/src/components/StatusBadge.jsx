import { ChevronDown } from "lucide-react";

const statusStyles = {
  "Not Started": "bg-gray-100 text-gray-500 border border-gray-300",
  "On going": "bg-amber-100 text-amber-700 border border-amber-300",
  Finished: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Overdue: "bg-red-100 text-red-700 border border-red-300",
  Review: "bg-amber-100 text-amber-700 border border-amber-300",
  Approve: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Revision: "bg-red-100 text-red-700 border border-red-300",
};

const priorityStyles = {
  "Not Urgent": "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Middle: "bg-amber-100 text-amber-700 border border-amber-300",
  Urgent: "bg-red-100 text-red-700 border border-red-300",
};

export function StatusBadge({ status, dropdown = false }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-600 border border-gray-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold ${style}`}>
      {status}
      {dropdown && <ChevronDown className="h-3.5 w-3.5" />}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const style = priorityStyles[priority] || "bg-gray-100 text-gray-600 border border-gray-300";
  return (
    <span className={`inline-flex rounded-md px-3 py-1 text-xs font-bold ${style}`}>
      {priority}
    </span>
  );
}