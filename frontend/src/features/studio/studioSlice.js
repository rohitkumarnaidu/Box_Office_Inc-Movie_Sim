import { createSlice } from "@reduxjs/toolkit";

const studioSlice = createSlice({
  name: "studio",
  initialState: {
    profile: null,
    stats: null,
    financialHistory: [],
    upgrades: [],
    franchises: [],
    awardsHistory: [],
    loading: false,
    error: null,
  },
  reducers: {
    setStudioProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateStudioMoney: (state, action) => {
      if (state.profile) {
        state.profile.money = action.payload;
      }
    },
    updateStudioStats: (state, action) => {
      if (state.profile) {
        state.profile.stats = { ...state.profile.stats, ...action.payload };
      }
    },
    setFinancialHistory: (state, action) => {
      state.financialHistory = action.payload;
    },
    appendFinancialRecord: (state, action) => {
      state.financialHistory.push(action.payload);
    },
    setUpgrades: (state, action) => {
      state.upgrades = action.payload;
    },
    addUpgrade: (state, action) => {
      state.upgrades.push(action.payload);
    },
    setFranchises: (state, action) => {
      state.franchises = action.payload;
    },
    addFranchise: (state, action) => {
      state.franchises.push(action.payload);
    },
    setAwardsHistory: (state, action) => {
      state.awardsHistory = action.payload;
    },
    addAward: (state, action) => {
      state.awardsHistory.push(action.payload);
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
  setStudioProfile,
  updateStudioMoney,
  updateStudioStats,
  setFinancialHistory,
  appendFinancialRecord,
  setUpgrades,
  addUpgrade,
  setFranchises,
  addFranchise,
  setAwardsHistory,
  addAward,
  setLoading,
  setError,
} = studioSlice.actions;

export const selectStudioProfile = (state) => state.studio.profile;
export const selectStudioStats = (state) => state.studio.profile?.stats;

export default studioSlice.reducer;
