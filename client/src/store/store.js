import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "./slices/themeSlice";
import languageReducer from "./slices/languageSlice";
import userReducer from "./slices/userSlice";

const store = configureStore({
  reducer: {
    theme: themeSlice,
    language: languageReducer,
    user: userReducer,
  },
});

export default store;
