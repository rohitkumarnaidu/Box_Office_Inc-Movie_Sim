import { useEffect, useState } from "react";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

import NotificationCard from "../../components/notifications/NotificationCard";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    const res = await api.get("/notifications");

    setNotifications(res.data.notifications);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);

    loadNotifications();
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");

    loadNotifications();
  };

  const deleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`);

    loadNotifications();
  };

  const deleteAll = async () => {
    await api.delete("/notifications");

    loadNotifications();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Notifications</h1>

          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white"
            >
              Mark All Read
            </button>

            <button
              onClick={deleteAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white"
            >
              Delete All
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onRead={markRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
