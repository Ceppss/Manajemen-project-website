function timeAgo(isoString) {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString.replace(" ", "T")).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function NotificationPanel({ notifications, onItemClick, onMarkAllRead }) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="absolute right-0 top-full z-30 pt-3">
      <div className="w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-bold text-navy">Notifications</p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
              {unreadCount} new
            </span>
          )}
        </div>

        <ul className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-gray-400">Belum ada notifikasi.</li>
          )}
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => onItemClick(n.id)}
                className="flex w-full gap-3 border-b border-gray-50 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-blue-500" : "bg-gray-200"}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.description}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={onMarkAllRead}
          className="w-full border-t border-gray-100 py-2.5 text-center text-xs font-semibold text-navy hover:bg-gray-50"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}
