import { useState, useRef } from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { currentUser, notifications as initialNotifications } from "../data/mockData";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import SearchBar from "./SearchBar";

const CLOSE_DELAY_MS = 250;

export default function Topbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifList, setNotifList] = useState(initialNotifications);
  const closeTimer = useRef(null);

  const hasUnread = notifList.some((n) => n.unread);

  function openNotifications() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setShowNotifications(true);
  }

  function scheduleCloseNotifications() {
    closeTimer.current = setTimeout(() => {
      setShowNotifications(false);
    }, CLOSE_DELAY_MS);
  }

  function handleNotificationClick(id) {
    setNotifList((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }

  function handleMarkAllRead() {
    setNotifList((list) => list.map((n) => ({ ...n, unread: false })));
  }

  function handleLogout() {
    navigate("/login");
  }

  return (
    <>
      <header className="flex h-[68px] shrink-0 items-center gap-6 border-b border-gray-200 bg-white px-8">
        <SearchBar />

        <div className="ml-auto flex items-center gap-5">
          <div className="relative" onMouseEnter={openNotifications} onMouseLeave={scheduleCloseNotifications}>
            <button className="relative text-gray-500 hover:text-navy" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
            {showNotifications && (
              <NotificationPanel
                notifications={notifList}
                onItemClick={handleNotificationClick}
                onMarkAllRead={handleMarkAllRead}
              />
            )}
          </div>

          <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-gray-50">
            <img src={currentUser.avatar} alt={currentUser.name} className="h-9 w-9 rounded-full object-cover" />
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-navy">{currentUser.department}</p>
              <p className="text-xs text-gray-400">{currentUser.zone}</p>
            </div>
          </button>

          <div className="h-8 w-px bg-gray-200" />

          <button onClick={handleLogout} aria-label="Logout" title="Logout" className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}