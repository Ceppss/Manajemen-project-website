import { Outlet } from "react-router-dom";
import Tabs from "../../components/Tabs";

export default function Dashboard() {
  return (
    <div>
      <Tabs
        tabs={[
          { label: "Overview", to: "/dashboard" },
          { label: "Calendar", to: "/dashboard/calendar" },
        ]}
      />
      <Outlet />
    </div>
  );
}
