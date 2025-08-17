/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bite: {
          excellent: "#10b981",
          good: "#3b82f6",
          average: "#f59e0b",
          fair: "#8b5cf6",
          poor: "#ef4444",
        }
      }
    },
  },
  plugins: [],
}
