import { configureStore } from '@reduxjs/toolkit';
import coinsReducer from '../features/coinsSlice';

export const store = configureStore({
  reducer: {
    coins: coinsReducer,
  },
});