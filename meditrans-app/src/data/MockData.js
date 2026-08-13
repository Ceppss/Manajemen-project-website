// Centralized mock data so every page module reads from the same source.
// In a real app this would come from API calls instead.

export const currentUser = {
  name: "Capt. Ryan Mercer",
  role: "Lead Dispatcher",
  department: "Operations Dept",
  zone: "HQ - Central Zone",
  avatar: "https://i.pravatar.cc/80?img=12",
};

export const members = [
  { id: "udin", name: "Udin", role: "Engineer", progress: 85 },
  { id: "budi", name: "Budi", role: "Engineer", progress: 45 },
  { id: "bunga", name: "Bunga", role: "Aplicant", progress: 62 },
];

export const priorityStyles = {
  "Not Urgent": "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Middle: "bg-amber-100 text-amber-700 border border-amber-300",
  Urgent: "bg-red-100 text-red-700 border border-red-300",
};

export const statusStyles = {
  "Not Started": "bg-gray-100 text-gray-500 border border-gray-300",
  "On going": "bg-amber-100 text-amber-700 border border-amber-300",
  Finished: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Overdue: "bg-red-100 text-red-700 border border-red-300",
  Review: "bg-amber-100 text-amber-700 border border-amber-300",
  Approve: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Revision: "bg-red-100 text-red-700 border border-red-300",
};

export let tasks = [
  {
    id: "t1",
    title: "Instalasi Cathlab",
    description: "Pemasangan unit cathlab baru di ruang tindakan 2.",
    priority: "Not Urgent",
    status: "On going",
    assignees: ["udin", "budi"],
    dueInDays: 5,
    dueColor: "overdue",
    startDate: "2026-08-01",
    endDate: "2026-08-20",
  },
  {
    id: "t2",
    title: "Pembelian Cateter",
    description: "Pengadaan cateter sesuai permintaan tim medis.",
    priority: "Middle",
    status: "On going",
    assignees: ["budi"],
    dueInDays: 7,
    dueColor: "finished",
    startDate: "2026-08-05",
    endDate: "2026-08-25",
  },
  {
    id: "t3",
    title: "PM RS Pluit",
    description: "Preventive maintenance alat di RS Pluit.",
    priority: "Urgent",
    status: "Finished",
    assignees: ["udin"],
    dueInDays: 12,
    dueColor: "ongoing",
    startDate: "2026-08-10",
    endDate: "2026-08-18",
  },
  {
    id: "t4",
    title: "Service Minto",
    description: "Servis rutin alat radiologi RS Mintoharjo.",
    priority: "Middle",
    status: "On going",
    assignees: ["budi", "bunga"],
    dueInDays: 3,
    dueColor: "overdue",
    startDate: "2026-08-15",
    endDate: "2026-09-05",
  },
  {
    id: "t5",
    title: "Pembelian BHP",
    description: "Pengadaan bahan habis pakai bulan ini.",
    priority: "Middle",
    status: "Not Started",
    assignees: ["budi"],
    dueInDays: 14,
    dueColor: "overdue",
    startDate: "2026-08-20",
    endDate: "2026-09-10",
  },
  {
    id: "t6",
    title: "PM RSAL",
    description: "Preventive maintenance alat di RSAL.",
    priority: "Urgent",
    status: "Not Started",
    assignees: ["bunga", "udin"],
    dueInDays: 20,
    dueColor: "ongoing",
    startDate: "2026-09-01",
    endDate: "2026-09-20",
  },
];

export const reports = [
  { id: "r1", priority: "Not Urgent", title: "Instalasi Cathlab", status: "Review", attachment: "Report 1" },
  { id: "r2", priority: "Middle", title: "Pembelian Cateter", status: "Review", attachment: "Report 2" },
  { id: "r3", priority: "Urgent", title: "PM RS PLuit", status: "Approve", attachment: "Report 3" },
  { id: "r4", priority: "Middle", title: "Service Minto", status: "Review", attachment: "Report 4" },
  { id: "r5", priority: "Middle", title: "Pembelian BHP", status: "Review", attachment: "Report 5" },
  { id: "r6", priority: "Urgent", title: "PM RSAL", status: "Approve", attachment: "Report 6" },
  { id: "r7", priority: "Not Urgent", title: "Pembelian PTCS ballon", status: "Revision", attachment: "Report 7" },
  { id: "r8", priority: "Not Urgent", title: "Service CT scan", status: "Approve", attachment: "Report 8" },
];

export const requests = [
  { id: "rq1", date: "22/1/2026", title: "Instalasi Cathlab", status: "Review", attachment: "Report 1" },
  { id: "rq2", date: "25/2/2026", title: "Pembelian Cateter", status: "Review", attachment: "Report 2" },
  { id: "rq3", date: "30/2/2026", title: "PM RS PLuit", status: "Approve", attachment: "Report 3" },
  { id: "rq4", date: "3/3/2026", title: "Service Minto", status: "Review", attachment: "Report 4" },
  { id: "rq5", date: "15/3/2026", title: "Pembelian BHP", status: "Review", attachment: "Report 5" },
  { id: "rq6", date: "20/3/2026", title: "PM RSAL", status: "Approve", attachment: "Report 6" },
  { id: "rq7", date: "27/3/2026", title: "Pembelian PTCS ballon", status: "Revision", attachment: "Report 7" },
  { id: "rq8", date: "1/4/2026", title: "Service CT scan", status: "Approve", attachment: "Report 8" },
];

export const dueSoon = [
  { title: "Instalasi Cathlab", days: 5, color: "overdue" },
  { title: "Pembelian Cateter", days: 7, color: "finished" },
  { title: "PM RS Pluit", days: 12, color: "ongoing" },
  { title: "Pembelian BHP", days: 14, color: "overdue" },
];

export const notifications = [
  {
    id: "n1",
    title: "Task assigned to you",
    description: "Udin assigned you to \"Instalasi Cathlab\".",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Report needs revision",
    description: "\"Pembelian PTCS ballon\" was sent back for revision.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Request approved",
    description: "Your Cuti request has been approved by Direktur.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "n4",
    title: "Deadline reminder",
    description: "\"PM RS Pluit\" is due in 12 days.",
    time: "2 days ago",
    unread: false,
  },
];

export const calendarTasks = [
  { day: 3, title: "Instalasi Cathlab", color: "#F5A623" },
  { day: 3, title: "PM RSAL", color: "#D9D9D9" },
  { day: 8, title: "Pembelian Cateter", color: "#2FBF71" },
  { day: 14, title: "PM RS Pluit", color: "#F5A623" },
  { day: 14, title: "Service Minto", color: "#EB5757" },
  { day: 14, title: "Pembelian BHP", color: "#F5A623" },
  { day: 21, title: "Service CT scan", color: "#2FBF71" },
  { day: 27, title: "Pembelian PTCS ballon", color: "#EB5757" },
];

export const projects = ["RS MintoHarjo", "RS Pluit", "RSAL", "RS Sanglah"];

export const overviewDonuts = {
  project: [
    { value: 25, color: "gray", label: "Not Started" },
    { value: 35, color: "amber", label: "On going" },
    { value: 25, color: "emerald", label: "Finished" },
    { value: 15, color: "red", label: "Overdue" },
  ],
  assignment: [
    { value: 20, color: "gray", label: "Not Started" },
    { value: 40, color: "amber", label: "On going" },
    { value: 25, color: "emerald", label: "Finished" },
    { value: 15, color: "red", label: "Overdue" },
  ],
  report: [
    { value: 55, color: "amber", label: "Reviewed" },
    { value: 30, color: "emerald", label: "Aproved" },
    { value: 15, color: "red", label: "Revision" },
  ],
};