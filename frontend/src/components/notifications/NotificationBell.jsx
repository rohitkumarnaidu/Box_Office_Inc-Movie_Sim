import { Bell } from "lucide-react";

const NotificationBell = ({ unreadCount, onClick }) => {
  return (
    <button onClick={onClick} className="relative">
      <Bell size={22} className="text-slate-300" />

      {unreadCount > 0 && (
        <span
          className="
          absolute
          -top-2
          -right-2
          min-w-4.5
          h-4.5
          flex
          items-center
          justify-center
          rounded-full
          bg-red-500
          text-[10px]
          font-bold
          text-white
        "
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
