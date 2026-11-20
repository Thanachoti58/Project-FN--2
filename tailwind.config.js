/**
 * Tailwind CSS config
 * - twin.macro อ่านไฟล์นี้ (ต้องเป็น .js / CommonJS)
 * - รวม design token ของ M-Bond + token มาตรฐานที่ TailGrids ใช้ (primary, dark, body-color, stroke ...)
 * - ถ้านำ component จาก TailGrids มาวาง ให้วางที่ src/components/tailgrids/ (อยู่ใน content glob แล้ว)
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ---------- M-Bond tokens (ธีมเขียวเข้ม) ----------
        surface: '#07181A', // พื้นหลังหลัก
        panel: '#0A1F1E', // sidebar
        card: '#0E2624', // การ์ด / ช่องกรอก
        line: '#173632', // เส้นขอบ
        ink: '#E8F4F0', // ตัวอักษรหลัก
        muted: '#8FAAA4', // ตัวอักษรรอง
        accent: '#2FE6A6', // สีเน้น
        brand: '#0E7C5A', // ปุ่มหลัก
        danger: '#F87171',
        deep: '#0B3028', // พื้นหลังแจ้งเตือน / step
        avatar: '#3B5A56',

        // ---------- TailGrids-compatible tokens ----------
        primary: '#3056D3',
        secondary: '#13C296',
        dark: '#111928',
        'body-color': '#637381',
        stroke: '#DFE4EA',
        'gray-1': '#F9FAFB',
        'gray-2': '#F3F4F6',
      },
      fontFamily: {
        sans: ["'Noto Sans Thai'", 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
