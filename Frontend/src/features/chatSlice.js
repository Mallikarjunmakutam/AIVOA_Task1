import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://127.0.0.1:8000';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      return data.reply || 'No response received.';
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      {
        id: 1,
        sender: 'ai',
        text: 'Hello! I am your AI assistant powered by Groq. Ask me anything about your healthcare interactions, doctors, or products.',
      },
    ],
    loading: false,
    status: 'online', // 'online' | 'error'
  },
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({
        id: Date.now(),
        sender: 'user',
        text: action.payload,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.status = 'online';
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'online';
        state.messages.push({
          id: Date.now() + 1,
          sender: 'ai',
          text: action.payload,
        });
      })
      .addCase(sendChatMessage.rejected, (state) => {
        state.loading = false;
        state.status = 'error';
        state.messages.push({
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I could not connect to the AI service. Please make sure the backend is running.',
        });
      });
  },
});

export const { addUserMessage } = chatSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectChatMessages = (state) => state.chat.messages;
export const selectChatLoading = (state) => state.chat.loading;
export const selectChatStatus = (state) => state.chat.status;

export default chatSlice.reducer;
