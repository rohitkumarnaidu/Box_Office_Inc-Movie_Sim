import { createSlice } from "@reduxjs/toolkit";

const movieSlice = createSlice({
  name: "movie",
  initialState: {
    activeMovies: [],
    movieHistory: [],
    selectedMovie: null,
    productionQueue: [],
    loading: false,
    error: null,
  },
  reducers: {
    setActiveMovies: (state, action) => {
      state.activeMovies = action.payload;
    },
    setMovieHistory: (state, action) => {
      state.movieHistory = action.payload;
    },
    setSelectedMovie: (state, action) => {
      state.selectedMovie = action.payload;
    },
    setProductionQueue: (state, action) => {
      state.productionQueue = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    appendToHistory: (state, action) => {
      state.movieHistory.unshift(action.payload);
    },
    updateMovieInList: (state, action) => {
      const updated = action.payload;
      const idx = state.activeMovies.findIndex(m => m._id === updated._id);
      if (idx !== -1) state.activeMovies[idx] = updated;
    },
    removeFromQueue: (state, action) => {
      state.productionQueue = state.productionQueue.filter(m => m._id !== action.payload);
    },
  },
});

export const {
  setActiveMovies,
  setMovieHistory,
  setSelectedMovie,
  setProductionQueue,
  setLoading,
  setError,
  appendToHistory,
  updateMovieInList,
  removeFromQueue,
} = movieSlice.actions;

export const selectActiveMovies = (state) => state.movie.activeMovies;
export const selectMovieHistory = (state) => state.movie.movieHistory;
export const selectMovieLoading = (state) => state.movie.loading;

export default movieSlice.reducer;
