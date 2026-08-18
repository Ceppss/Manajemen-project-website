// Display-only mock data (reference/user-facing static content).
// Operational data (projects, tasks, reports, users) lives in the backend database
// and is loaded via src/auth/store.js.

export const currentUser = {
  name: "Capt. Ryan Mercer",
  role: "Lead Dispatcher",
  avatar: "https://i.pravatar.cc/80?img=12",
};

export const notifications = [  {
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
