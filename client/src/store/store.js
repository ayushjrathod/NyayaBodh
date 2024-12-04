import { configureStore } from '@reduxjs/toolkit';
import themeSlice from './slices/themeSlice'
import languageReducer from './slices/languageSlice';

const store = configureStore({
    reducer: {
        theme: themeSlice,
        language: languageReducer
    },
});

export default store;

