import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.items.find(n => n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  addNotification,
  markAsRead,
  markAllAsRead,
  setLoading,
  setError,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.items;
export const selectUnreadCount = (state) => state.notification.unreadCount;

export default notificationSlice.reducer;
