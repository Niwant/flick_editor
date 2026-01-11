/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flick': {
          'primary': '#ffffff', // Pure white background
          'secondary': '#f5f5f5',
          'accent': '#f0f0f0', // Very light gray for subtle highlights
          'peach': '#FFDBCC', // Peach color for instruction nodes
          'border': '#e5e5e5', // Subtle light gray border matching natural design
          'text': '#333333', // Softer dark gray (not pure black)
          'text-muted': '#666666',
          'text-light': '#999999',
        },
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
