import { Outlet } from "react-router-dom";
import Tabs from "../../components/Tabs";
import { getRole, canSeeDailyReport } from "../../auth/role";

export default function Report() {
  const role = getRole();
  const tabs = [
    { label: "Daily Report", to: "/report/daily" },
    { label: "Project Report", to: "/report/project" },
  ].filter((t) => canSeeDailyReport(role) || t.to !== "/report/daily");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy">Reports</h2>
      </div>
      <Tabs tabs={tabs} />
      <Outlet />
    </div>
  );
}
