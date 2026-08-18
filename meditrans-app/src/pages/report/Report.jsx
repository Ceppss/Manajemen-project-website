import { Outlet } from "react-router-dom";
import Tabs from "../../components/Tabs";

export default function Report() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy">Reports</h2>
        <p className="mt-0.5 text-sm text-gray-400">Laporan harian dan laporan project yang sudah dikumpulkan.</p>
      </div>
      <Tabs
        tabs={[
          { label: "Daily Report", to: "/report/daily" },
          { label: "Project Report", to: "/report/project" },
        ]}
      />
      <Outlet />
    </div>
  );
}
