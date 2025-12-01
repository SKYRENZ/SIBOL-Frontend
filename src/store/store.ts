import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import additivesReducer from './slices/additivesSlice';

const store = configureStore({
  reducer: {
    admin: adminReducer,
    additives: additivesReducer,
    // ...existing reducers...
  },
});

// export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// default + named export so both import styles work
export default store;
export { store };