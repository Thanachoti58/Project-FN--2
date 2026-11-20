export * from './status';
export * from './roles';
export * from './bondFields';
export * from './bondTerms';

/** รหัสผ่านตัวอย่างของระบบ (ใช้กับบัญชีทดลองทุกบัญชี) */
export const DEMO_PASSWORD = 'pass';

/** key ที่ใช้เก็บข้อมูลใน localStorage / sessionStorage */
export const STORAGE_KEYS = {
  state: 'mbond_state_v1',
  session: 'mbond_session',
} as const;

/** ภาพที่ใช้ในระบบ (อยู่ใน /public/images) */
export const IMAGES = {
  logo: '/images/logo.webp',
  mark: '/images/mark.webp',
  demoDocument: '/images/demo-document.jpg',
} as const;
