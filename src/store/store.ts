import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import additivesReducer from './slices/additivesSlice';
import wasteContainerReducer from './slices/wasteContainerSlice';

const store = configureStore({
  reducer: {
    admin: adminReducer,
    additives: additivesReducer,
    wasteContainer: wasteContainerReducer,
  },
});

// export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// default + named export so both import styles work
export default store;
export { store };