import React, { useEffect } from 'react'
import App from './App';
import { useSelector } from 'react-redux';


function AppContainer() {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);


    return (
        <main className={`${isDarkMode ? 'yellow-bright' : 'light'}  text-foreground bg-background`}>
            <App />
        </main>
    )
}

export default AppContainer