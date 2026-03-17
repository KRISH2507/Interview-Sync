import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;

        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        root.classList.remove('light', 'dark');
        body.classList.remove('light', 'dark');

        root.classList.add(theme);
        body.classList.add(theme);

        root.setAttribute('data-theme', theme);
        body.setAttribute('data-theme', theme);

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
