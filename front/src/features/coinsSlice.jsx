import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
};

export const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { increment } = coinsSlice.actions;
export default coinsSlice.reducer;