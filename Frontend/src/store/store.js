import { configureStore } from '@reduxjs/toolkit';
import interactionsReducer from '../features/interactionsSlice';
import chatReducer from '../features/chatSlice';
import uiReducer from '../features/uiSlice';

const store = configureStore({
  reducer: {
    interactions: interactionsReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
});

export default store;
