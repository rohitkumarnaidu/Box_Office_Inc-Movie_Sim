import { useEffect, useState } from "react";
import api from "../../api/axios";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await api.get("/notifications");

    setNotifications(res.data.notifications.slice(0, 6));
  };

  return (
    <div
      className="
      absolute
      right-0
      top-12
      w-96
      bg-[#0f172a]
      border
      border-slate-800
      rounded-2xl
      shadow-2xl
      z-50
      overflow-hidden
    "
    >
      <div className="p-4 border-b border-slate-800">
        <h2 className="font-bold text-white">Notifications</h2>
      </div>

      <div className="max-h-112.5 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n._id}
            className="
            p-4
            border-b
            border-slate-800
            hover:bg-slate-800/50
          "
          >
            <p className="text-sm text-white">{n.message}</p>

            <p className="text-xs text-slate-500 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;
