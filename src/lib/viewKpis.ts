/**
 * การ์ดตัวเลขสรุป (KPI) ที่แสดงใต้หัวข้อของแต่ละหน้า + แถบ workflow
 * key = ชื่อหน้า (view)
 */
import type { Status } from '@/types';
import type { IconName } from '@/components/ui/Icon';
import { IN_REVIEW } from '@/constants';
import { store } from '@/store/store';
import { crossCheck, isIncomplete, scopeBonds } from '@/store/selectors';
import { flatten } from './tree';
import { nf } from './format';

export interface Kpi {
  label: string;
  value: string | number;
  color: string;
  icon: IconName;
}

const G = '#2FE6A6'; // accent
const BLUE = '#38BDF8';
const PURPLE = '#A78BFA';
const AMBER = '#FBBF24';
const RED = '#F87171';
const ORANGE = '#FB923C';
const GRAY = '#94A3B8';

const D = () => store.data.D;
/** จำนวนเอกสารในสถานะนั้นภายในขอบเขตของผู้ใช้ (บริษัทเห็นเฉพาะของตน) */
export const countBy = (s: Status): number => scopeBonds().filter((d) => d.s === s).length;
const all = (s: Status) => D().filter((d) => d.s === s).length;
const usable = () => store.data.T.filter((t) => t.on && !t.upd).length;
const myProjects = () => store.data.PG.filter((p) => p.co === store.session.co);
const k = (label: string, value: string | number, color: string, icon: IconName): Kpi => ({ label, value, color, icon });

export const VIEW_KPIS: Record<string, () => Kpi[]> = {
  users: () => [
    k('ผู้ใช้ทั้งหมด', store.data.U.length, BLUE, 'user'),
    k('ใช้งานอยู่', store.data.U.filter((u) => u.on).length, G, 'check'),
    k('ปิดใช้งาน', store.data.U.filter((u) => !u.on).length, GRAY, 'clock'),
    k('คำเชิญรอตอบรับ', store.data.INV.length, AMBER, 'send'),
  ],
  apub: () => [
    k('เผยแพร่แล้ว', all('published'), G, 'up'),
    k('ภาครัฐ', D().filter((d) => d.s === 'published' && d.sector === 'government').length, BLUE, 'file'),
    k('ภาคเอกชน', D().filter((d) => d.s === 'published' && d.sector !== 'government').length, PURPLE, 'file'),
    k('ลบแล้ว', store.data.DEL.length, RED, 'clock'),
  ],
  log: () => [
    k('รายการทั้งหมด', store.data.L.length, BLUE, 'clock'),
    k('การเข้าใช้ระบบ', store.data.L.filter((l) => l.c === 'sys').length, G, 'user'),
    k('งานเอกสาร', store.data.L.filter((l) => l.c === 'doc').length, PURPLE, 'file'),
    k('งาน Template', store.data.L.filter((l) => l.c === 'tpl').length, AMBER, 'list'),
  ],
  orecv: () => [
    k('รอตรวจ', all('submitted'), BLUE, 'list'),
    k('พร้อมส่ง Manager', D().filter((d) => d.s === 'submitted' && !isIncomplete(d) && !crossCheck(d).length).length, G, 'check'),
    k('ไม่ครบ / ไม่ผ่าน', D().filter((d) => d.s === 'submitted' && (isIncomplete(d) || crossCheck(d).length)).length, ORANGE, 'clock'),
  ],
  otrk: () => [
    k('ทั้งหมด', scopeBonds().length, BLUE, 'list'),
    k('ระหว่างตรวจ', scopeBonds().filter((d) => IN_REVIEW.includes(d.s)).length, AMBER, 'clock'),
    k('เผยแพร่แล้ว', countBy('published'), G, 'up'),
    k('ส่งกลับ', countBy('returned'), RED, 'send'),
  ],
  ctpl: () => [
    k('Template ที่ใช้งานได้', usable(), G, 'list'),
    k('เอกสารรวมทุก Template', store.data.T.reduce((a, t) => a + flatten(t.items).length, 0), BLUE, 'file'),
  ],
  onew: () => [k('กำลังจัดทำ', countBy('draft'), PURPLE, 'file'), k('รายการทั้งหมด', scopeBonds().length, BLUE, 'list')],
  cprog: () => [
    k('โครงการ', myProjects().length, BLUE, 'list'),
    k('วงเงินรวม (ล้านบาท)', nf(myProjects().reduce((a, p) => a + p.limit, 0)), PURPLE, 'file'),
    k('ใช้ไป (ล้านบาท)', nf(myProjects().reduce((a, p) => a + p.used, 0)), AMBER, 'up'),
    k('คงเหลือ (ล้านบาท)', nf(myProjects().reduce((a, p) => a + p.limit - p.used, 0)), G, 'check'),
  ],
  oreo: () => [
    k('ตราสารที่ Reopen ได้', scopeBonds().filter((d) => d.s === 'published' && !d.ro).length, G, 'file'),
    k('คำขอ Reopen', scopeBonds().filter((d) => d.ro).length, BLUE, 'send'),
  ],
  oedit: () => [k('ร่าง', countBy('draft'), PURPLE, 'file'), k('ถูกส่งกลับ', countBy('returned'), RED, 'send')],
  oup: () => [
    k('ไฟล์ยังไม่ครบ', scopeBonds().filter((d) => ['draft', 'returned'].includes(d.s) && isIncomplete(d)).length, ORANGE, 'up'),
    k('ถูกส่งกลับ', countBy('returned'), RED, 'send'),
  ],
  osend: () => [
    k('พร้อมส่ง', scopeBonds().filter((d) => d.s === 'draft' && !isIncomplete(d)).length, G, 'send'),
    k('ยังไม่ครบ', scopeBonds().filter((d) => d.s === 'draft' && isIncomplete(d)).length, ORANGE, 'clock'),
  ],
  chist: () => [
    k('ยื่นทั้งหมด', scopeBonds().length, BLUE, 'list'),
    k('เผยแพร่แล้ว', countBy('published'), G, 'up'),
    k('ยกเลิก/ปฏิเสธ', countBy('cancelled') + countBy('rejected'), GRAY, 'clock'),
  ],
  tnew: () => [k('Template ทั้งหมด', store.data.T.length, BLUE, 'list'), k('Template ที่ใช้งานได้', usable(), G, 'check')],
  tedit: () => [
    k('Template ทั้งหมด', store.data.T.length, BLUE, 'list'),
    k('Template ที่ใช้งานได้', usable(), G, 'check'),
    k('ต้องปรับปรุง', store.data.T.filter((t) => t.upd).length, AMBER, 'clock'),
    k('Template ที่ปิดใช้งาน', store.data.T.filter((t) => !t.on).length, RED, 'clock'),
  ],
  tfmt: () => [k('Template ทั้งหมด', store.data.T.length, BLUE, 'list'), k('Template ที่ใช้งานได้', usable(), G, 'check')],
  tver: () => [
    k('Template ทั้งหมด', store.data.T.length, BLUE, 'list'),
    k('มีหลายเวอร์ชัน', store.data.T.filter((t) => t.v > 1).length, PURPLE, 'check'),
    k('ต้องปรับปรุง (ออก Version ได้)', store.data.T.filter((t) => t.upd).length, AMBER, 'clock'),
  ],
  rdata: () => [k('รอตรวจ', all('pending'), BLUE, 'check'), k('รออนุมัติ', all('approving'), AMBER, 'list')],
  ratt: () => [
    k('รอตรวจ', all('pending'), BLUE, 'check'),
    k('แนบครบ', D().filter((d) => d.s === 'pending' && !isIncomplete(d)).length, G, 'file'),
  ],
  rapp: () => [
    k('รออนุมัติ', all('approving'), AMBER, 'list'),
    k('อนุมัติแล้ว', all('approved'), PURPLE, 'check'),
    k('ปฏิเสธ', all('rejected'), RED, 'send'),
  ],
  rpub: () => [
    k('รอเผยแพร่', all('approved'), PURPLE, 'up'),
    k('เผยแพร่แล้ว', all('published'), G, 'file'),
    k('Archive รวม', D().reduce((a, d) => a + (d.a || 0), 0), GRAY, 'clock'),
  ],
};

/** หน้าที่แสดงแถบ workflow */
export const FLOW_VIEWS = new Set(['orecv', 'otrk', 'osend', 'oedit', 'oup', 'chist', 'rdata', 'ratt', 'rapp', 'rpub', 'apub']);

/** สถานะที่ไฮไลต์ในแถบ workflow ของแต่ละหน้า */
export const HIGHLIGHT: Record<string, Status> = {
  orecv: 'submitted',
  osend: 'draft',
  oedit: 'draft',
  oup: 'draft',
  ratt: 'pending',
  rdata: 'pending',
  rapp: 'approving',
  rpub: 'approved',
};
