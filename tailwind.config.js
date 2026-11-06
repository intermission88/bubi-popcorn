// Setelah menambah class Tailwind baru di index.html: npm run build:css
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html'],
    // Dibentuk dinamis di validateRatingInput (text-${themeColor}-400)
    safelist: ['text-sky-400', 'text-pink-400'],
    darkMode: 'class',
            theme: {
                extend: {
                    // Skala tipografi iPhone: caption 12 (label), xs 13 (sekunder), sm 15 (isi), base 16+ bawaan
                    fontSize: {
                        caption: ['12px', { lineHeight: '1.4' }],
                        xs: ['13px', { lineHeight: '1.45' }],
                        sm: ['15px', { lineHeight: '1.5' }]
                    },
                    fontFamily: {
                        sans: ['Figtree', 'sans-serif'],
                        display: ['"Bricolage Grotesque"', 'sans-serif'],
                    },
                    colors: {
                        // Emas tunggal: amber disamakan dengan kuning #facc15 (brand)
                        amber: { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' },
                        cinema: { 950: '#000000', 900: '#050505', 800: '#121212' }
                    },
                    keyframes: {
                        shake: {
                            '0%, 100%': { transform: 'translateX(0)' },
                            '20%, 60%': { transform: 'translateX(-4px)' },
                            '40%, 80%': { transform: 'translateX(4px)' },
                        },
                        goldGlow: {
                            '0%, 100%': { borderColor: 'rgba(250, 204, 21, 0.6)', boxShadow: '0 0 16px rgba(250, 204, 21, 0.25)' },
                            '50%': { borderColor: 'rgba(250, 204, 21, 1)', boxShadow: '0 0 26px rgba(250, 204, 21, 0.5)' }
                        },
                        popIn: {
                            '0%': { transform: 'scale(0.92)', opacity: '0' },
                            '100%': { transform: 'scale(1)', opacity: '1' }
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(100%)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' }
                        },
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' }
                        },
                        pulseSlow: {
                            '0%, 100%': { opacity: '1' },
                            '50%': { opacity: '0.4' }
                        }
                    },
                    animation: {
                        shake: 'shake 0.3s ease-in-out',
                        goldGlow: 'goldGlow 2.5s infinite ease-in-out',
                        popIn: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        slideUp: 'slideUp 0.26s cubic-bezier(0.2, 0.9, 0.25, 1) forwards',
                        fadeIn: 'fadeIn 0.25s ease-out forwards',
                        pulseSlow: 'pulseSlow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }
                }
            }
};
