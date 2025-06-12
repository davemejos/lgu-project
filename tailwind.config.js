/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
    // Ensure all possible locations are included
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Prevent aggressive purging in development
  mode: process.env.NODE_ENV === 'production' ? 'jit' : undefined,
  // Safelist commonly used dynamic classes
  safelist: [
    // Dynamic width/height classes
    'w-12', 'w-14', 'h-12', 'h-14',
    // Dynamic positioning classes
    'left-2', 'left-4', 'bottom-2', 'bottom-4',
    // Dynamic text colors
    'text-blue-100', 'text-blue-500', 'text-gray-500', 'text-gray-700', 'text-gray-800', 'text-white',
    // Dynamic background colors
    'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-gray-100', 'bg-gray-200', 'bg-white',
    // Dynamic border colors
    'border-gray-200', 'border-gray-300', 'border-blue-500',
    // Dynamic flex classes
    'flex-row', 'flex-row-reverse', 'justify-start', 'justify-end',
    // Dynamic responsive classes
    'max-sm:left-2', 'max-sm:bottom-2', 'max-sm:w-12', 'max-sm:h-12',
    // Status classes
    'status-active', 'status-inactive', 'status-on-leave', 'status-suspended',
    // Animation classes
    'animate-ping', 'animate-pulse', 'animate-spin',
    // Transform classes
    'transform', 'rotate-180',
    // Gradient classes
    'gradient-primary',
    // Input utility classes
    'input-primary', 'input-search', 'input-chat', 'input-error', 'input-success',
    // Focus classes
    'focus-ring',
    // Dashboard banner classes
    'dashboard-banner',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Add custom animations to prevent disconnection
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
