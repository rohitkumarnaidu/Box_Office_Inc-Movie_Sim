import { createSlice } from "@reduxjs/toolkit";

const simulationSlice = createSlice({
  name: "simulation",
  initialState: {
    currentWeek: 1,
    currentYear: 1,
    isRunning: false,
    lastSummary: null,
    weekProgress: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentWeek: (state, action) => {
      state.currentWeek = action.payload;
      state.currentYear = Math.floor((action.payload - 1) / 52) + 1;
    },
    advanceWeek: (state) => {
      state.currentWeek += 1;
      state.currentYear = Math.floor((state.currentWeek - 1) / 52) + 1;
    },
    setSimulationRunning: (state, action) => {
      state.isRunning = action.payload;
    },
    setLastSummary: (state, action) => {
      state.lastSummary = action.payload;
    },
    setWeekProgress: (state, action) => {
      state.weekProgress = Math.min(100, Math.max(0, action.payload));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetSimulation: (state) => {
      state.currentWeek = 1;
      state.currentYear = 1;
      state.isRunning = false;
      state.lastSummary = null;
      state.weekProgress = 0;
    },
  },
});

export const {
  setCurrentWeek,
  advanceWeek,
  setSimulationRunning,
  setLastSummary,
  setWeekProgress,
  setLoading,
  setError,
  resetSimulation,
} = simulationSlice.actions;

export const selectCurrentWeek = (state) => state.simulation.currentWeek;
export const selectCurrentYear = (state) => state.simulation.currentYear;
export const selectSimulationRunning = (state) => state.simulation.isRunning;

export default simulationSlice.reducer;
