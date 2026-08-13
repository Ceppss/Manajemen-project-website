import { Outlet } from "react-router-dom";
import Tabs from "../../components/Tabs";

export default function Dashboard() {
  return (
    <div>
      <Tabs
        tabs={[
          { label: "Calendar", to: "/dashboard/calendar" },
          { label: "Summary", to: "/dashboard/summary" },
        ]}
      />
      <Outlet />
    </div>
  );
}