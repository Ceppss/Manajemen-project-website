import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CalendarView from "./pages/dashboard/CalendarView";
import OverviewView from "./pages/dashboard/OverviewView";
import ProjectList from "./pages/project/ProjectList";
import ProjectView from "./pages/project/ProjectView";
import AddAssignment from "./pages/project/AddAssignment";
import AssignmentList from "./pages/assignment/AssignmentList";
import AddTask from "./pages/assignment/AddTask";
import EditTask from "./pages/assignment/EditTask";
import SubtaskView from "./pages/assignment/SubtaskView";
import Report from "./pages/report/Report";
import DailyReport from "./pages/report/DailyReport";
import ProjectReport from "./pages/report/ProjectReport";
import AddReport from "./pages/report/AddReport";
import EditReport from "./pages/report/EditReport";
import ReportDetail from "./pages/report/ReportDetail";
import AdminProject from "./pages/admin/AdminProject";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminAudit from "./pages/admin/AdminAudit";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<OverviewView />} />
          <Route path="calendar" element={<CalendarView />} />
        </Route>

        <Route path="/project" element={<ProjectList />} />
        <Route path="/project/:id" element={<ProjectView />} />
        <Route path="/project/add-assignment" element={<AddAssignment />} />

        <Route path="/assignment" element={<AssignmentList />} />
        <Route path="/assignment/add-task" element={<AddTask />} />
        <Route path="/assignment/edit-task/:id" element={<EditTask />} />
        <Route path="/assignment/subtask/:taskId/:subtaskId" element={<SubtaskView />} />

        <Route path="/report" element={<Report />}>
          <Route index element={<Navigate to="/report/daily" replace />} />
          <Route path="daily" element={<DailyReport />} />
          <Route path="project" element={<ProjectReport />} />
          <Route path="add" element={<AddReport />} />
          <Route path="edit/:id" element={<EditReport />} />
          <Route path="detail/:id" element={<ReportDetail />} />
        </Route>
        <Route path="/admin" element={<Navigate to="/admin/project" replace />} />
        <Route path="/admin/project" element={<AdminProject />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
      </Route>
    </Routes>
  );
}