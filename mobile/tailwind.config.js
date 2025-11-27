/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#ff6b6b',
                dark: '#1a1a2e',
                light: '#f8f9fa',
            },
            fontFamily: {
                sans: ['Outfit_400Regular'],
                'outfit': ['Outfit_600SemiBold'],
                'outfit-bold': ['Outfit_700Bold'],
                'outfit-regular': ['Outfit_400Regular'],
            }
        },
    },
    plugins: [],
}
