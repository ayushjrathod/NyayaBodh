import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: (() => {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            const isAuth = localStorage.getItem('isAuthenticated') === 'true';
            return Boolean(token && user && isAuth);
        } catch {
            return false;
        }
    })(),
    userRole: (() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.role || null;
        } catch {
            return null;
        }
    })(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthState: (state, action) => {
            state.isAuthenticated = action.payload;
            if (!action.payload) {
                localStorage.clear();
                document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                state.userRole = null;
            }
            window.dispatchEvent(new Event('auth-state-changed'));
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        },
        checkAuthState: (state) => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');
                const isAuth = localStorage.getItem('isAuthenticated') === 'true';
                const isValid = Boolean(token && userStr && isAuth);

                state.isAuthenticated = isValid;
                if (userStr) {
                    const user = JSON.parse(userStr);
                    state.userRole = user.role;
                } else {
                    state.userRole = null;
                }
            } catch {
                state.isAuthenticated = false;
                state.userRole = null;
            }
        },
    },
});

export const { setAuthState, setUserRole, checkAuthState } = authSlice.actions;

export default authSlice.reducer;
