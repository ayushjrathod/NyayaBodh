import { createSlice } from '@reduxjs/toolkit';
import i18n from '../../components/Navbar/i18n';

const languageSlice = createSlice({
    name: 'language',
    initialState: {
        language: 'en',
    },
    reducers: {
        setLanguage: (state, action) => {
            state.language = action.payload;
            i18n.changeLanguage(action.payload);
        },

    },
});

export const { setLanguage } = languageSlice.actions;

export default languageSlice.reducer;
