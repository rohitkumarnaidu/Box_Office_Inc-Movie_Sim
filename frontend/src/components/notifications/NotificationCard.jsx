const NotificationCard = ({ notification, onRead, onDelete }) => {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        notification.read
          ? "bg-slate-900 border-slate-800"
          : "bg-violet-950/30 border-violet-800"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white">{notification.message}</p>

          <p className="text-xs text-slate-400 mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          {!notification.read && (
            <button
              onClick={() => onRead(notification._id)}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Read
            </button>
          )}

          <button
            onClick={() => onDelete(notification._id)}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
