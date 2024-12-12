import React, { useEffect } from 'react';

const GoogleTranslate = () => {
    useEffect(() => {
        // Function to load the Google Translate script
        const loadGoogleTranslateScript = () => {
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        };

        // Function to initialize the Google Translate element
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: "en,hi,mr,kn",
                    autoDisplay: false,
                    layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
                },

                'google_translate_element'
            );
        };

        // Load the script
        loadGoogleTranslateScript();

        // Cleanup function to remove the script when component unmounts
        return () => {
            const script = document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]');
            if (script) {
                document.body.removeChild(script);
            }
            delete window.googleTranslateElementInit;
        };
    }, []); // Empty dependency array ensures this effect runs only once

    return (

        <div id="google_translate_element" className='max-w-[4.2rem] max-h-5 overflow-clip'></div>

    );
};

export default GoogleTranslate;

