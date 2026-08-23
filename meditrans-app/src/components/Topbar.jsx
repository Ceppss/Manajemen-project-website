import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { currentUser } from "../data/mockData";
import {
  clearSession, getUser, getProfile,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from "../auth/api";
import { getRole } from "../auth/role";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import SearchBar from "./SearchBar";

const CLOSE_DELAY_MS = 250;
const POLL_INTERVAL_MS = 30000;

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const closeTimer = useRef(null);

  const loadNotifications = useCallback(() => {
    getNotifications().then(setNotifList).catch(() => {});
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const hasUnread = notifList.some((n) => n.unread);
  const role = getRole();
  const sessionUser = getUser();
  const profile = getProfile(sessionUser?.id);
  const displayName = profile?.name || sessionUser?.name || currentUser.name;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

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
    markNotificationRead(id).catch(() => {});
    const link = notifList.find((n) => n.id === id)?.link;
    if (link) {
      setShowNotifications(false);
      navigate(link);
    }
  }

  function handleMarkAllRead() {
    setNotifList((list) => list.map((n) => ({ ...n, unread: false })));
    markAllNotificationsRead().catch(() => {});
  }

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <>
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-8">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="text-gray-500 hover:text-navy lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SearchBar />

        <div className="ml-auto flex items-center gap-5">
          <span className="hidden rounded-md bg-navy/10 px-2.5 py-1 text-[11px] font-bold text-navy sm:inline-block">
            {role}
          </span>

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
            {profile?.photo ? (
              <img src={profile.photo} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                {initials}
              </span>
            )}
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-semibold text-navy">{displayName}</p>
              <p className="text-xs text-gray-400">{role}</p>
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