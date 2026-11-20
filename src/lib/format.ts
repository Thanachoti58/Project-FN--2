/**
 * ฟังก์ชันช่วยเรื่องวันที่ / ตัวเลข / ข้อความ
 */
import type { Bond } from '@/types';

/** วันที่และเวลาแบบไทย เช่น "19 พ.ย. 2569 10:05" */
export const fmtDT = (d: Date): string =>
  d.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

/** วันนี้ในรูปแบบ YYYY-MM-DD */
export const today = (): string => new Date().toISOString().slice(0, 10);

/** วันนี้เวลา h:m (ใช้สร้างข้อมูลตัวอย่าง) */
export const todayAt = (h: number, m: number): string => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return fmtDT(d);
};

/** จำนวนปีระหว่างสองวันที่ */
export const yrs = (a: string | Date, b: string | Date): number =>
  (new Date(b).getTime() - new Date(a).getTime()) / 31557600000;

/** บวกอายุตราสาร (เช่น "5 ปี", "6 เดือน", "270 วัน") เข้ากับวันที่ แล้วคืน YYYY-MM-DD */
export function addTenor(date: string, tenor: string): string {
  const n = parseFloat(tenor) || 0;
  const x = new Date(date);
  if (/ปี/.test(tenor)) x.setFullYear(x.getFullYear() + n);
  else if (/เดือน/.test(tenor)) x.setMonth(x.getMonth() + n);
  else x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
}

/** จัดรูปแบบตัวเลขมีคอมมา (ว่าง = "-") */
export const nf = (v: number | string | null | undefined): string =>
  v == null || v === '' ? '-' : Number(v).toLocaleString('en-US');

/** ประเภทผู้ออก (ภาครัฐบาล / ภาคเอกชน) */
export const issuerLabel = (d: Bond): string => (d.sector === 'government' ? 'ภาครัฐบาล' : 'ภาคเอกชน');

/** เปอร์เซ็นต์ความคืบหน้า (กันหารศูนย์) */
export const pct = (done: number, total: number): number => (done / Math.max(1, total)) * 100;
