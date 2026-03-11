import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import superAdminReducer from './slices/superAdminSlice';
import additivesReducer from './slices/additivesSlice';
import wasteContainerReducer from './slices/wasteContainerSlice';
import machineReducer from './slices/machineSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    admin: adminReducer,
    superadmin: superAdminReducer,
    additives: additivesReducer,
    wasteContainer: wasteContainerReducer,
    machine: machineReducer,
    auth: authReducer,
  },
});

// export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// default + named export so both import styles work
export default store;
export { store };