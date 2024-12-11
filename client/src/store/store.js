import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slices/adminSlice";
import languageReducer from "./slices/languageSlice";
import themeSlice from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
const store = configureStore({
  reducer: {
    theme: themeSlice,
    language: languageReducer,
    user: userReducer,
    admin: adminReducer,
    auth: authReducer,
  },
});

export default store;
