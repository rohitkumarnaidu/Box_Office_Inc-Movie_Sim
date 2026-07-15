import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import toastReducer from "../features/ui/toastSlice";
import talentReducer from "../features/talent/talentSlice";
import { saveTalentFilters } from "../features/talent/talentFiltersStorage";
import awardsReducer from "../features/awards/awardsSlice";
import { authApi } from "../features/auth/authApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    talent: talentReducer,
    awards: awardsReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

// Persist talent filter selections so they survive navigation and reloads
// (issue #10). Only writes when the talent slice actually changes.
let lastTalentState = store.getState().talent;
store.subscribe(() => {
  const nextTalentState = store.getState().talent;
  if (nextTalentState !== lastTalentState) {
    lastTalentState = nextTalentState;
    saveTalentFilters(nextTalentState);
  }
});
