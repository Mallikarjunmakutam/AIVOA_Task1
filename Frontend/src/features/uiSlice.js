import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedInteraction: null, // interaction being edited
    isEditMode: false,
    notifications: [], // { id, type: 'success'|'error'|'info', message }
  },
  reducers: {
    setSelectedInteraction(state, action) {
      state.selectedInteraction = action.payload;
      state.isEditMode = !!action.payload;
    },
    clearSelectedInteraction(state) {
      state.selectedInteraction = null;
      state.isEditMode = false;
    },
    addNotification(state, action) {
      state.notifications.push({
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
      });
    },
    removeNotification(state, action) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const {
  setSelectedInteraction,
  clearSelectedInteraction,
  addNotification,
  removeNotification,
} = uiSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectSelectedInteraction = (state) => state.ui.selectedInteraction;
export const selectIsEditMode = (state) => state.ui.isEditMode;
export const selectNotifications = (state) => state.ui.notifications;

export default uiSlice.reducer;
