/**
 * ACTIONS / AUTH — เข้าสู่ระบบ / ออกจากระบบ
 */
import { DEMO_PASSWORD, STORAGE_KEYS } from '@/constants';
import { emit, store } from '../store';
import { logActivity } from './ui';

/** เข้าสู่ระบบ — คืนข้อความ error ถ้าไม่สำเร็จ */
export function login(username: string, password: string, remember: boolean): string | null {
  const em = username.trim().toLowerCase();
  const u = store.data.U.find((x) => (x.email || '').toLowerCase() === em);
  if (!u || password !== DEMO_PASSWORD) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if (!u.on) return 'บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อ admin';

  if (u.co && !store.data.CO.includes(u.co)) store.data.CO.push(u.co);
  store.session = { user: u, role: u.r, co: u.co || store.data.CO[0] };
  store.ui.q = '';

  try {
    localStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.removeItem(STORAGE_KEYS.session);
    // จดจำ = เก็บข้ามการปิดเบราว์เซอร์ / ไม่จดจำ = เก็บเฉพาะแท็บนี้
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEYS.session, em);
  } catch {
    /* ignore */
  }
  logActivity('เข้าสู่ระบบ', 'sys');
  emit();
  return null;
}

export function logout(): void {
  logActivity('ออกจากระบบ', 'sys');
  store.session = { user: null, role: 'company', co: store.data.CO[0] };
  store.ui.dm = store.ui.vm = store.ui.av = store.ui.modal = null;
  try {
    localStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.removeItem(STORAGE_KEYS.session);
  } catch {
    /* ignore */
  }
  emit();
}
