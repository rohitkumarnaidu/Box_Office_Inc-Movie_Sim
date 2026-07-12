import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import toastReducer from "../features/ui/toastSlice";
import talentReducer from "../features/talent/talentSlice";
import { saveTalentFilters } from "../features/talent/talentFiltersStorage";
import awardsReducer from "../features/awards/awardsSlice";
import movieReducer from "../features/movie/movieSlice";
import studioReducer from "../features/studio/studioSlice";
import simulationReducer from "../features/simulation/simulationSlice";
import notificationReducer from "../features/notification/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    talent: talentReducer,
    awards: awardsReducer,
    movie: movieReducer,
    studio: studioReducer,
    simulation: simulationReducer,
    notification: notificationReducer,
  },
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
