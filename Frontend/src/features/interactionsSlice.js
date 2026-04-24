import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://127.0.0.1:8000';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API}/api/interactions`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const searchInteractions = createAsyncThunk(
  'interactions/search',
  async (searchQuery = '', { rejectWithValue }) => {
    try {
      if (!searchQuery) return [];
      const url = `${API}/api/interactions?search=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to search');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


export const createInteraction = createAsyncThunk(
  'interactions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API}/api/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.detail || 'Failed to create');
      }
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateInteraction = createAsyncThunk(
  'interactions/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API}/api/interactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.detail || 'Failed to update');
      }
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API}/api/interactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) return rejectWithValue('Failed to delete');
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState: {
    list: [],
    searchResults: [],
    loading: false,
    searchLoading: false,
    error: null,
    searchQuery: '',
  },
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchQuery = '';
    }
  },
  extraReducers: (builder) => {
    // fetchInteractions (Main List)
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // searchInteractions (Header Search)
    builder
      .addCase(searchInteractions.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchInteractions.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchInteractions.rejected, (state) => {
        state.searchLoading = false;
        state.searchResults = [];
      });


    // createInteraction
    builder
      .addCase(createInteraction.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // updateInteraction
    builder
      .addCase(updateInteraction.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        
        const searchIdx = state.searchResults.findIndex((i) => i.id === action.payload.id);
        if (searchIdx !== -1) state.searchResults[searchIdx] = action.payload;
      })
      .addCase(updateInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // deleteInteraction
    builder
      .addCase(deleteInteraction.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((i) => i.id !== action.payload);
        state.searchResults = state.searchResults.filter((i) => i.id !== action.payload);
      })
      .addCase(deleteInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, clearSearchResults } = interactionsSlice.actions;


// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectInteractions = (state) => state.interactions.list;
export const selectSearchResults = (state) => state.interactions.searchResults;
export const selectInteractionsLoading = (state) => state.interactions.loading;
export const selectSearchLoading = (state) => state.interactions.searchLoading;
export const selectInteractionsError = (state) => state.interactions.error;
export const selectSearchQuery = (state) => state.interactions.searchQuery;

export default interactionsSlice.reducer;
