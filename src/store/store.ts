/**
 * ============================================================
 *  STORE — state กลางของแอป (singleton)
 * ------------------------------------------------------------
 *  - data    : ข้อมูลธุรกิจบันทึกลง localStorage, ไฟล์แนบจริงบันทึกลง IndexedDB
 *  - session : ผู้ใช้ที่ล็อกอินอยู่
 *  - ui      : state ชั่วคราวของหน้าจอ (ช่องค้นหา, modal, toast)
 *
 *  ข้อมูลถูกแก้แบบ in-place แล้วเรียก emit() เพื่อแจ้งให้ React render ใหม่
 *  (ผ่าน useSyncExternalStore ใน hooks/useStore.ts)
 * ============================================================
 */
import type { AppData, PromptModalState, Role, User, VersionDraft } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { clearBlobs } from '@/lib/blobs';
import { COMPANIES, createSeed } from './seed';

export interface SessionState {
  user: User | null;
  role: Role;
  co: string;
}

export interface FilePreview {
  name: string;
  /** ไฟล์ชั่วคราวก่อนบันทึกรายการ */
  href?: string;
  /** key ของไฟล์ที่บันทึกถาวรใน IndexedDB */
  blobKey?: string;
}

export interface UiState {
  q: string;
  dm: string | null; // id ตราสารที่เปิดดูรายละเอียด
  vm: VersionDraft | null; // หน้าต่างออก Version ใหม่
  av: { id: string; v: number } | null; // หน้าต่าง Archive
  modal: PromptModalState | null;
  toast: string | null;
  preview: FilePreview | null;
}

export interface Store {
  hydrated: boolean;
  data: AppData;
  session: SessionState;
  ui: UiState;
}

export const store: Store = {
  hydrated: false,
  data: createSeed(),
  session: { user: null, role: 'company', co: COMPANIES[0] },
  ui: { q: '', dm: null, vm: null, av: null, modal: null, toast: null, preview: null },
};

/* ---------------- subscribe / emit ---------------- */
let version = 0;
let resetting = false;
const listeners = new Set<() => void>();

export const subscribe = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getVersion = (): number => version;

/** แจ้งว่าข้อมูลเปลี่ยนแล้ว (render ใหม่ + บันทึกลง localStorage) */
export function emit(persistData = true): void {
  version++;
  if (persistData) persist();
  listeners.forEach((fn) => fn());
}

/* ---------------- persist ---------------- */
function persist(): void {
  if (!store.hydrated || resetting || typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.state, JSON.stringify({ v: 2, data: store.data }));
  } catch {
    /* โควตาเต็ม / private mode — ข้ามไป */
  }
}

/** โหลดข้อมูลที่บันทึกไว้ + กู้คืนเซสชัน (เรียกครั้งเดียวฝั่ง client) */
export function hydrate(): void {
  if (store.hydrated) return;
  let migratedFiles = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.state);
    if (raw) {
      const s = JSON.parse(raw) as { v?: number; data?: Partial<AppData> };
      if (s && (s.v === 1 || s.v === 2) && s.data) {
        (Object.keys(s.data) as (keyof AppData)[]).forEach((k) => {
          const val = s.data?.[k];
          if (val !== undefined && val !== null) (store.data as unknown as Record<string, unknown>)[k] = val;
        });
        if (s.v === 1) {
          store.data.D.forEach((bond) => { bond.up = {}; });
          migratedFiles = true;
        }
      }
    }
  } catch {
    /* ข้อมูลเสีย — ใช้ข้อมูลตัวอย่าง */
  }
  // แปลงบทบาทและชื่อบัญชีรุ่นเก่าให้เป็น manager
  store.data.U.forEach((u) => {
    if ((u.r as string) === 'reviewer') u.r = 'manager';
    if (u.email === 'reviewer') u.email = 'manager';
    if (u.email === 'reviewer2') u.email = 'manager2';
  });
  try {
    const email = localStorage.getItem(STORAGE_KEYS.session) || sessionStorage.getItem(STORAGE_KEYS.session);
    const u = email && store.data.U.find((x) => (x.email || '').toLowerCase() === email);
    if (u && u.on) {
      store.session = { user: u, role: u.r, co: u.co || store.data.CO[0] };
    }
  } catch {
    /* ไม่มี storage */
  }
  store.hydrated = true;
  if (migratedFiles) persist();
  emit(false);
}

/** ล้างข้อมูลที่บันทึกไว้ทั้งหมดแล้วโหลดหน้าใหม่ (กลับเป็นข้อมูลตัวอย่าง) */
export async function resetAllData(): Promise<void> {
  try {
    await clearBlobs();
  } catch {
    store.ui.toast = 'ล้างไฟล์แนบไม่สำเร็จ กรุณาลองใหม่';
    emit(false);
    return;
  }
  resetting = true;
  try {
    localStorage.removeItem(STORAGE_KEYS.state);
    localStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.removeItem(STORAGE_KEYS.session);
  } catch {
    /* ignore */
  }
  window.location.href = '/login';
}

/** id หัวข้อ Template ถัดไป */
export const nextNodeId = (): string => 'n' + ++store.data.NID;
