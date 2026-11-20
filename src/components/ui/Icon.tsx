/** ไอคอน SVG (เส้น) — path เก็บไว้ใน ICON_PATHS */
const ICON_PATHS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z',
  list: 'M4 6h16M4 12h16M4 18h16',
  file: 'M6 3h9l5 5v13H6zM14 3v6h6',
  check: 'M5 12l5 5L20 7',
  clock: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18',
  gear: 'M12 8a4 4 0 100 8 4 4 0 000-8M12 2v3M12 19v3M2 12h3M19 12h3',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8M4 21a8 8 0 0116 0',
  up: 'M12 16V4M6 10l6-6 6 6M4 20h16',
  send: 'M3 11l18-8-8 18-2-8z',
  bell: 'M6 9a6 6 0 0112 0c0 6 3 7 3 7H3s3-1 3-7M10 20a2 2 0 004 0',
  srch: 'M11 4a7 7 0 100 14 7 7 0 000-14M21 21l-5-5',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="shrink-0"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
