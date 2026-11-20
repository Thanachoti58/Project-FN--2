/**
 * ============================================================
 *  SELECTORS — ฟังก์ชันอ่านข้อมูลที่คำนวณจาก store
 * ============================================================
 */
import type { Bond, BondInfo, Status, Template } from '@/types';
import { addTenor, nf, today, yrs } from '@/lib/format';
import { flatten, walkTree } from '@/lib/tree';
import { store } from './store';

const EMPTY_TEMPLATE: Template = {
  id: '',
  n: '(ไม่พบ Template)',
  items: [],
  on: false,
  v: 0,
  arch: 0,
  upd: false,
  hist: [],
  verDate: '',
};

/* ---------------- Template ---------------- */
export const getTpl = (id: string): Template => store.data.T.find((t) => t.id === id) ?? EMPTY_TEMPLATE;

/** Template ที่เลือกใช้สร้างรายการใหม่ได้ (เปิดใช้งาน และไม่อยู่ระหว่างปรับปรุง) */
export const usableTemplates = (): Template[] => store.data.T.filter((t) => t.on && !t.upd);

/* ---------------- นับเอกสาร ---------------- */
/** จำนวนเอกสารที่ต้องแนบทั้งหมดตาม Template */
export const need = (d: Bond): number => flatten(getTpl(d.tp).items).length;

/** จำนวนเอกสารที่แนบแล้ว (นับเฉพาะหัวข้อที่ยังอยู่ใน Template) */
export const filesCount = (d: Bond): number => {
  const ok = new Set(flatten(getTpl(d.tp).items).map((n) => n.id));
  return Object.keys(d.up || {}).filter((k) => ok.has(k)).length;
};

export const isIncomplete = (d: Bond): boolean => filesCount(d) < need(d);

/** รายชื่อหัวข้อ (ระดับล่างสุด) ที่ยังไม่แนบ เช่น "1.2 งบการเงิน" */
export const missingDocs = (d: Bond): string[] => {
  const out: string[] = [];
  walkTree(getTpl(d.tp).items, (n, no) => {
    if (!n.c.length && !(d.up || {})[n.id]) out.push(no + ' ' + n.t);
  });
  return out;
};

/* ---------------- กรองรายการ ---------------- */
export const byStatus = (s: Status): Bond[] => store.data.D.filter((d) => d.s === s);
export const countStatus = (s: Status): number => byStatus(s).length;

/** รายการของบริษัทที่ล็อกอินอยู่ */
export const mine = (): Bond[] => store.data.D.filter((d) => d.co === store.session.co);
export const mineCount = (s: Status): number => mine().filter((d) => d.s === s).length;

/** ขอบเขตข้อมูลตามบทบาท: บริษัทเห็นเฉพาะของตัวเอง ส่วนอื่นเห็นทั้งหมด */
export const scopeBonds = (): Bond[] => (store.session.role === 'company' ? mine() : store.data.D);

/* ---------------- ข้อมูลรายละเอียดตราสาร ---------------- */
export type BondView = Record<
  'sym' | 'iss' | 'mat' | 'reg' | 'term' | 'ttm' | 'size' | 'out' | 'opt' | 'sec' | 'rep' | 'regs' | 'cd' | 'ri' | 'rc',
  string
>;

/** ข้อมูลตราสารสำหรับแสดงผล (วันที่ ปี มูลค่า ฯลฯ ที่จัดรูปแบบแล้ว) */
export function bondView(d: Bond): BondView {
  const x: Partial<BondInfo> = store.data.BI[d.id] || d.info || {};
  const iss = x.iss || d.date || '';
  const mat = x.mat || (iss ? addTenor(iss, d.tenor) : '');
  return {
    sym: d.symbol || '-',
    iss: iss || '-',
    mat: mat || '-',
    reg: x.reg || '-',
    term: iss && mat ? yrs(iss, mat).toFixed(2) : '-',
    ttm: mat ? Math.max(0, yrs(new Date(), mat)).toFixed(2) : '-',
    size: nf(x.size),
    out: nf(x.out),
    opt: x.opt || '-',
    sec: x.sec || '-',
    rep: x.rep || '-',
    regs: x.regs || '-',
    cd: nf(x.cd),
    ri: x.ri || '-',
    rc: x.rc || '-',
  };
}

/** สร้างข้อมูลตราสารที่ใช้บันทึกใน BI ตอนเผยแพร่ครั้งแรก */
export function makeBondInfo(d: Bond): Partial<BondInfo> {
  const i = d.info || {};
  return {
    ...i,
    iss: i.iss || today(),
    size: i.size == null ? 0 : +i.size,
    out: i.out == null ? +(i.size || 0) : +i.out,
  };
}

/* ---------------- Cross-check (MTN / Reopen) ---------------- */
/** ตรวจความสอดคล้องของรายการ MTN / Reopen — คืนรายการข้อผิดพลาด (ว่าง = ผ่าน) */
export function crossCheck(d: Bond): string[] {
  const r: string[] = [];
  if (d.pg) {
    const p = store.data.PG.find((x) => x.id === d.pg);
    if (!p) r.push('ไม่พบโครงการ MTN');
    else {
      if (p.exp < today()) r.push('โครงการหมดอายุ ' + p.exp);
      if ((d.size ?? 0) > p.limit - p.used) r.push('เกินวงเงินคงเหลือ');
    }
  }
  if (d.ro) {
    const b = store.data.D.find((x) => x.id === d.ro);
    if (!b || b.s !== 'published') r.push('ไม่พบรุ่นเดิมที่เผยแพร่');
    else {
      const i = bondView(b);
      const rt = store.data.BI[b.id]?.rate;
      if (i.mat < today()) r.push('รุ่นเดิมครบกำหนดแล้ว');
      if (d.symbol !== b.symbol) r.push('Symbol ไม่ตรง');
      if (d.rf?.mat !== i.mat) r.push('วันครบกำหนดไม่ตรง');
      if (d.rf?.rate !== rt) r.push(`อัตราดอกเบี้ยในเอกสาร ${d.rf?.rate} ≠ รุ่นเดิม ${rt}`);
    }
  }
  return r;
}

/** ตราสารที่ขอ Reopen ได้: เผยแพร่แล้วและไม่ใช่คำขอ Reopen เอง */
export const reopenable = (): Bond[] =>
  store.data.D.filter((d) => d.co === store.session.co && d.s === 'published' && !d.ro);
