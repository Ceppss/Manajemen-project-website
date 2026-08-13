import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CalendarView from "./pages/dashboard/CalendarView";
import SummaryView from "./pages/dashboard/SummaryView";
import ProjectView from "./pages/project/ProjectView";
import AddAssignment from "./pages/project/AddAssignment";
import AssignmentList from "./pages/assignment/AssignmentList";
import AddTask from "./pages/assignment/AddTask";
import EditTask from "./pages/assignment/EditTask";

function ComingSoon({ label }) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
      <p className="text-lg font-semibold text-navy">{label}</p>
      <p className="mt-1 text-sm text-gray-400">Halaman ini belum dibuat.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="/dashboard/calendar" replace />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="summary" element={<SummaryView />} />
        </Route>

        <Route path="/project" element={<ProjectView />} />
        <Route path="/project/add-assignment" element={<AddAssignment />} />

        <Route path="/assignment" element={<AssignmentList />} />
        <Route path="/assignment/add-task" element={<AddTask />} />
        <Route path="/assignment/edit-task/:id" element={<EditTask />} />

        <Route path="/report" element={<ComingSoon label="Report" />} />
        <Route path="/request" element={<ComingSoon label="Request" />} />
        <Route path="/admin" element={<ComingSoon label="Admin" />} />
      </Route>
    </Routes>
  );
}