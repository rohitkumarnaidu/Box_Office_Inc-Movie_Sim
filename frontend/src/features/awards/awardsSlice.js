import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async action to fetch awards
export const fetchAwards = createAsyncThunk(
  'awards/fetchAwards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/awards'); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch awards');
    }
  }
);

const awardsSlice = createSlice({
  name: 'awards',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAwards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAwards.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAwards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default awardsSlice.reducer;
