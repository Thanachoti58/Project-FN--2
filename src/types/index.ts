/**
 * ============================================================
 *  TYPES — ชนิดข้อมูลทั้งหมดของระบบ M-Bond
 * ============================================================
 */

/** บทบาทผู้ใช้งาน */
export type Role = 'admin' | 'officer' | 'company' | 'manager';

/** สถานะเอกสารตราสารหนี้ */
export type Status =
  | 'draft'
  | 'submitted'
  | 'pending'
  | 'approving'
  | 'returned'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'cancelled';

export type Sector = 'private' | 'government';
export type TermGroup = 'short' | 'long';
export type LogCategory = 'doc' | 'tpl' | 'sys';

/** โหนดในโครงสร้างหัวข้อ Template (หัวข้อ / หัวข้อย่อย) */
export interface TreeNode {
  id: string;
  t: string;
  c: TreeNode[];
}

/** ประวัติ Version เก่าของ Template (Archive) */
export interface TemplateHistory {
  v: number;
  n: string;
  items: TreeNode[];
  date: string;
  note: string;
}

export interface Template {
  id: string;
  n: string;
  items: TreeNode[];
  on: boolean; // เปิดใช้งาน
  v: number; // version ปัจจุบัน
  arch: number; // จำนวน archive
  upd: boolean; // ต้องปรับปรุง
  hist: TemplateHistory[];
  verDate: string;
  note?: string;
}

/** ข้อมูลรายละเอียดตราสาร (วันที่ / มูลค่า / หลักประกัน / เรตติ้ง) */
export interface BondInfo {
  rate?: number;
  iss: string;
  mat: string;
  reg: string;
  size: number | null;
  out: number | null;
  opt: string;
  sec: string;
  rep: string;
  regs: string;
  cd: number | null;
  ri: string;
  rc: string;
}

/** รายการตราสารหนี้ / เอกสารที่ยื่น */
export interface Bond {
  id: string;
  n: string;
  co: string;
  tp: string; // id ของ Template
  s: Status;
  v: number;
  a: number; // จำนวน archive
  note: string;
  date: string;
  sector: Sector;
  kind: string;
  symbol: string;
  tenor: string;
  termGroup: TermGroup;
  /** เอกสารที่แนบ: key = id หัวข้อ Template, value = ชื่อไฟล์ */
  up: Record<string, string>;
  info?: Partial<BondInfo>;
  /** MTN: id โครงการ */
  pg?: string;
  /** MTN: มูลค่าที่เสนอขาย (ล้านบาท) */
  size?: number;
  /** Reopen: id ตราสารเดิม */
  ro?: string;
  add?: number;
  rdate?: string;
  rf?: { mat: string; rate: number | undefined };
}

export interface User {
  n: string;
  email: string; // ชื่อผู้ใช้สำหรับล็อกอิน
  r: Role;
  co?: string;
  on: boolean;
  added?: boolean;
  mail?: string;
}

export interface Invite {
  email: string;
  rep: string;
  co: string;
  t: string;
}

export interface MtnProject {
  id: string;
  co: string;
  n: string;
  limit: number;
  used: number;
  exp: string;
}

export interface LogEntry {
  t: string;
  u: string;
  a: string;
  c: LogCategory;
}

export interface DeletedRecord {
  t: string;
  u: string;
  id: string;
  n: string;
  reason: string;
}

/** ข้อมูลระบบที่บันทึกลง localStorage; เนื้อหาไฟล์แนบแยกเก็บใน IndexedDB */
export interface AppData {
  D: Bond[];
  PG: MtnProject[];
  T: Template[];
  L: LogEntry[];
  INV: Invite[];
  U: User[];
  BI: Record<string, Partial<BondInfo>>;
  CO: string[];
  DEL: DeletedRecord[];
  NID: number;
}

/** ข้อมูล modal ถามค่า (prompt) */
export interface PromptModalState {
  title: string;
  value: string;
  area?: boolean;
  cb: (value: string) => void;
}

/** ข้อมูลหน้าต่าง "ออก Version ใหม่" */
export interface VersionDraft {
  id: string;
  cur: number;
  n: string;
  note: string;
  items: TreeNode[];
}

export interface IssuerKindOption {
  value: string;
  label: string;
}

/** คอลัมน์เพิ่มเติมของตารางตราสารหนี้ */
export interface ExtraColumn {
  header: string;
  render: (bond: Bond) => React.ReactNode;
}
