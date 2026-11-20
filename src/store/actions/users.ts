/**
 * ACTIONS / USERS — จัดการผู้ใช้งานและคำเชิญ (Admin)
 */
import type { Role } from '@/types';
import { ROLES } from '@/constants';
import { fmtDT } from '@/lib/format';
import { emit, store } from '../store';
import { logActivity, toast } from './ui';

const exists = (email: string) => store.data.U.some((u) => (u.email || '').toLowerCase() === email);

/** เพิ่มเจ้าหน้าที่ภายในโดยตรง — คืน true ถ้าเพิ่มสำเร็จ */
export function addStaff(name: string, email: string, role: Role): boolean {
  const em = email.trim().toLowerCase();
  if (role === 'company') return toast('ผู้ใช้บริษัทต้องใช้การชวนผู้ใช้'), false;
  if (exists(em)) return toast('อีเมลนี้มีในระบบแล้ว'), false;
  store.data.U.push({ n: name.trim(), email: em, r: role, co: '', on: true, added: true });
  logActivity(`เพิ่มเจ้าหน้าที่ ${name} (${ROLES[role].name})`, 'sys');
  toast('เพิ่มเจ้าหน้าที่แล้ว — ล็อกอินด้วยอีเมลนี้ รหัสผ่าน pass');
  emit();
  return true;
}

/** ชวนผู้ใช้บริษัทผ่านอีเมล */
export function inviteUser(email: string, rep: string, company: string): boolean {
  const em = email.trim().toLowerCase();
  const rp = rep.trim();
  const co = company.trim();
  if (!em || !rp || !co) return toast('กรุณากรอกอีเมล ชื่อผู้แทน และชื่อบริษัทให้ครบ'), false;
  if (exists(em) || store.data.INV.some((v) => v.email === em)) {
    return toast('อีเมลนี้มีในระบบหรือถูกชวนไว้แล้ว'), false;
  }
  store.data.INV.unshift({ email: em, rep: rp, co, t: fmtDT(new Date()) });
  logActivity(`ชวนผู้ใช้ ${rp} (${em}) เข้าบริษัท ${co}`, 'sys');
  toast('ส่งคำเชิญไปที่ ' + em + ' แล้ว');
  emit();
  return true;
}

export function resendInvite(i: number): void {
  const v = store.data.INV[i];
  v.t = fmtDT(new Date());
  logActivity('ส่งคำเชิญซ้ำ ' + v.email, 'sys');
  toast('ส่งคำเชิญซ้ำแล้ว');
  emit();
}

export function revokeInvite(i: number): void {
  const v = store.data.INV.splice(i, 1)[0];
  logActivity('ยกเลิกคำเชิญ ' + v.email, 'sys');
  toast('ยกเลิกคำเชิญแล้ว');
  emit();
}

/** จำลองการที่ผู้ถูกชวนกดตอบรับคำเชิญ */
export function acceptInvite(i: number): void {
  const x = store.data.INV.splice(i, 1)[0];
  if (!store.data.CO.includes(x.co)) store.data.CO.push(x.co);
  store.data.U.push({ n: x.rep, email: x.email, r: 'company', co: x.co, on: true, added: true });
  logActivity(`${x.rep} (${x.email}) ตอบรับคำเชิญเข้าบริษัท ${x.co}`, 'sys');
  toast('ตอบรับคำเชิญแล้ว — ' + x.rep + ' เป็นผู้ใช้บริษัทเรียบร้อย');
  emit();
}

/** เปิด/ปิดการใช้งานผู้ใช้ (i = index ใน store.data.U) */
export function toggleUser(i: number): void {
  const u = store.data.U[i];
  u.on = !u.on;
  logActivity(`${u.on ? 'เปิด' : 'ปิด'}ผู้ใช้ ${u.n}`, 'sys');
  emit();
}
