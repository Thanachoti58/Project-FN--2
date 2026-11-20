/**
 * ACTIONS / UI — toast, modal ถามค่า, ช่องค้นหา, รายละเอียดตราสาร, ดูตัวอย่างไฟล์, บันทึก Log
 */
import type { LogCategory } from '@/types';
import { ROLES } from '@/constants';
import { fmtDT } from '@/lib/format';
import { emit, store } from '../store';

/** บันทึกประวัติการใช้งาน (ไม่ emit — ให้ action ที่เรียกเป็นคน emit) */
export function logActivity(a: string, c: LogCategory = 'doc'): void {
  store.data.L.unshift({
    t: fmtDT(new Date()),
    u: store.session.user?.n || ROLES[store.session.role].name,
    a,
    c,
  });
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
/** แสดงข้อความแจ้งเตือนชั่วคราว 2.2 วินาที */
export function toast(message: string): void {
  store.ui.toast = message;
  emit(false);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    store.ui.toast = null;
    emit(false);
  }, 2200);
}

/** เปิด modal ถามข้อความ แล้วเรียก cb เมื่อกดยืนยัน */
export function ask(title: string, value: string, cb: (v: string) => void, area = false): void {
  store.ui.modal = { title, value, area, cb };
  emit(false);
}

/** ปิด modal ถามค่า (ok = กดยืนยัน) */
export function closePrompt(ok: boolean, value: string): void {
  const m = store.ui.modal;
  store.ui.modal = null;
  if (ok && m) m.cb(value);
  emit();
}

export function setSearch(q: string): void {
  store.ui.q = q;
  emit(false);
}

export function openDetail(id: string): void {
  store.ui.dm = id;
  emit(false);
}
export function closeDetail(): void {
  store.ui.dm = null;
  emit(false);
}

export function openPreview(name: string, href?: string, blobKey?: string): void {
  store.ui.preview = { name, href, blobKey };
  emit(false);
}
export function closePreview(): void {
  store.ui.preview = null;
  emit(false);
}
