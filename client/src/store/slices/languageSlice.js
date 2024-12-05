import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const languageSlice = createSlice({
    name: 'language',
    initialState: {
        language: 'en',
        translations: {}, // Cache for translated texts, because it is limited
    },
    reducers: {
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
        setTranslation: (state, action) => {
            const { text, translatedText } = action.payload;
            state.translations[text] = translatedText; // storing/caching translations
        },
    },
});

export const { setLanguage, setTranslation } = languageSlice.actions;


export const fetchTranslation = (text, targetLang) => async (dispatch, getState) => {
    const { translations } = getState().language;

    // If translation is already cached, use it (avoidng multiple requests)
    if (translations[text]) return;

    try {
        const response = await axios.post('https://libretranslate.com/translate', {
            q: text,
            source: 'en', // default is always english
            target: targetLang,
        }, {
            headers: { 'Content-Type': 'application/json' },
        });

        dispatch(setTranslation({ text, translatedText: response.data.translatedText }));
    } catch (error) {
        console.error('Translation error:', error);
    }
};

export default languageSlice.reducer;
