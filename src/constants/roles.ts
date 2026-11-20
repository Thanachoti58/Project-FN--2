import type { Role } from '@/types';
import type { IconName } from '@/components/ui/Icon';

export interface MenuItem {
  /** ชื่อหน้า = path ของ route (เช่น "users" → /users) */
  view: string;
  label: string;
  icon: IconName;
}

export interface RoleConfig {
  /** ชื่อ role ที่แสดงใต้ชื่อผู้ใช้ */
  name: string;
  /** คำอธิบายบทบาท */
  title: string;
  menu: MenuItem[];
  /** ปุ่มลัดบนหน้าหลัก */
  quickActions: { view: string; label: string }[];
}

/** เมนูและข้อมูลของแต่ละบทบาท */
export const ROLES: Record<Role, RoleConfig> = {
  admin: {
    name: 'admin',
    title: 'ผู้ดูแลระบบ',
    menu: [
      { view: 'home', label: 'หน้าหลัก', icon: 'home' },
      { view: 'users', label: 'จัดการผู้ใช้งาน', icon: 'user' },
      { view: 'apub', label: 'เอกสารที่เผยแพร่แล้ว', icon: 'file' },
      { view: 'log', label: 'ตรวจสอบประวัติการใช้งาน', icon: 'clock' },
    ],
    quickActions: [
      { view: 'users', label: 'จัดการผู้ใช้งาน' },
      { view: 'apub', label: 'เอกสารที่เผยแพร่' },
      { view: 'log', label: 'ประวัติการใช้งาน' },
    ],
  },
  officer: {
    name: 'document',
    title: 'ผู้ดูแลเอกสาร',
    menu: [
      { view: 'home', label: 'หน้าหลัก', icon: 'home' },
      { view: 'orecv', label: 'ตรวจเอกสารที่ได้รับ', icon: 'check' },
      { view: 'otrk', label: 'ติดตามสถานะเอกสาร', icon: 'clock' },
    ],
    quickActions: [
      { view: 'orecv', label: 'ตรวจเอกสารที่ได้รับ' },
      { view: 'otrk', label: 'ติดตามสถานะ' },
    ],
  },
  company: {
    name: 'user (company)',
    title: 'บริษัทผู้เสนอตราสารหนี้',
    menu: [
      { view: 'home', label: 'หน้าหลัก', icon: 'home' },
      { view: 'ctpl', label: 'เทมเพลตเอกสาร', icon: 'list' },
      { view: 'onew', label: 'สร้างรายการตราสารหนี้', icon: 'file' },
      { view: 'cprog', label: 'โครงการ MTN', icon: 'list' },
      { view: 'oreo', label: 'ขอ Reopen ตราสารเดิม', icon: 'file' },
      { view: 'oedit', label: 'บันทึกและแก้ไขข้อมูล', icon: 'list' },
      { view: 'oup', label: 'เอกสารที่ไม่ครบ/ส่งกลับแก้ไข', icon: 'up' },
      { view: 'osend', label: 'ส่งเอกสารให้ Document', icon: 'send' },
      { view: 'otrk', label: 'ตรวจสอบความคืบหน้า', icon: 'clock' },
      { view: 'chist', label: 'ประวัติการยื่น', icon: 'clock' },
    ],
    quickActions: [
      { view: 'onew', label: '+ สร้างรายการตราสารหนี้' },
      { view: 'cprog', label: 'โครงการ MTN' },
      { view: 'oreo', label: 'ขอ Reopen' },
    ],
  },
  manager: {
    name: 'manager',
    title: 'ผู้ตรวจสอบ / ผู้เผยแพร่ / ผู้จัดการ Template',
    menu: [
      { view: 'home', label: 'หน้าหลัก', icon: 'home' },
      { view: 'tnew', label: 'สร้าง Template', icon: 'file' },
      { view: 'tedit', label: 'แก้ไข Template', icon: 'list' },
      { view: 'tfmt', label: 'จัดการรูปแบบเอกสาร', icon: 'list' },
      { view: 'tver', label: 'จัดการเวอร์ชัน Template', icon: 'check' },
      { view: 'rdata', label: 'ตรวจสอบข้อมูลตราสารหนี้', icon: 'check' },
      { view: 'ratt', label: 'ตรวจสอบเอกสารแนบ', icon: 'file' },
      { view: 'rret', label: 'ส่งกลับเพื่อแก้ไข', icon: 'send' },
      { view: 'rapp', label: 'อนุมัติหรือปฏิเสธเอกสาร', icon: 'check' },
      { view: 'rpub', label: 'เผยแพร่เอกสารฉบับปัจจุบัน', icon: 'up' },
      { view: 'log', label: 'ดูประวัติการดำเนินการ', icon: 'clock' },
    ],
    quickActions: [
      { view: 'rapp', label: 'อนุมัติเอกสาร' },
      { view: 'rpub', label: 'เผยแพร่' },
      { view: 'tnew', label: 'สร้าง Template' },
    ],
  },
};

/** ตรวจสอบว่าบทบาทนี้เข้าหน้านี้ได้ไหม */
export function canAccess(role: Role, view: string): boolean {
  return ROLES[role].menu.some((m) => m.view === view);
}
