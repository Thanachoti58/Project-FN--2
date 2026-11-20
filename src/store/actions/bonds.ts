/**
 * ACTIONS / BONDS — workflow เอกสารตราสารหนี้ทั้งหมด
 *   บริษัท → Document → Manager (ตรวจ/อนุมัติ) → เผยแพร่
 */
import type { Bond, BondInfo, Sector } from '@/types';
import { GOVERNMENT_KINDS } from '@/constants';
import { fmtDT, nf, today } from '@/lib/format';
import { flatten } from '@/lib/tree';
import { deleteBlob, setBlob } from '@/lib/blobs';
import { emit, store } from '../store';
import { bondView, crossCheck, getTpl, isIncomplete, makeBondInfo } from '../selectors';
import { ask, logActivity, toast } from './ui';

const find = (id: string): Bond | undefined => store.data.D.find((d) => d.id === id);

/** รหัสรายการถัดไปที่ไม่ซ้ำกับของเดิม เช่น DB-018 */
function nextBondId(prefix: string): string {
  let n = store.data.D.length + 1;
  while (store.data.D.some((d) => d.id === prefix + '-' + String(n).padStart(3, '0'))) n++;
  return prefix + '-' + String(n).padStart(3, '0');
}

/** บริษัทแตะต้องได้เฉพาะรายการของบริษัทตัวเอง */
export function canTouch(id: string): boolean {
  const { session, data } = store;
  if (session.role === 'company' && !data.D.some((d) => d.id === id && d.co === session.co)) {
    toast('ไม่มีสิทธิ์เข้าถึงรายการของบริษัทอื่น');
    return false;
  }
  return true;
}

/* ============================================================
 *  บริษัท (Company)
 * ============================================================ */

/** สร้างโครงการ MTN ใหม่ */
export function createProject(name: string, limit: number, exp: string): void {
  const id = 'MTN-' + String(store.data.PG.length + 1).padStart(2, '0');
  store.data.PG.unshift({ id, co: store.session.co, n: name, limit, used: 0, exp });
  logActivity('สร้างโครงการ MTN ' + id);
  toast('สร้างโครงการ ' + id + ' แล้ว');
  emit();
}

/** สร้างรุ่นย่อย MTN ภายใต้โครงการ — คืน id ของรายการใหม่ */
export function createSubIssue(projectId: string, symbol: string, size: number, tenor: string): string | null {
  const p = store.data.PG.find((x) => x.id === projectId);
  if (!p) return null;
  if (p.exp < today()) return toast('โครงการหมดอายุแล้ว สร้างรุ่นย่อยไม่ได้'), null;
  if (size > p.limit - p.used) {
    return toast('เกินวงเงินคงเหลือ (' + nf(p.limit - p.used) + ' ล้านบาท)'), null;
  }
  const id = nextBondId('DB');
  store.data.D.unshift({
    ...blankBond(id, 'MTN ' + p.n + ' ' + symbol, 'TPL-05'),
    co: store.session.co,
    kind: 'MTN',
    symbol,
    tenor,
    pg: p.id,
    size,
  });
  logActivity(`สร้างรุ่นย่อย MTN ${id} ผูก ${p.id}`);
  toast('สร้าง ' + id + ' — แนบเอกสารให้ครบ');
  emit();
  return id;
}

/** สร้างคำขอ Reopen ตราสารเดิม — คืน id ของรายการใหม่ */
export function createReopen(baseId: string, addSize: number, date: string): string | null {
  const b = find(baseId);
  if (!b) return null;
  const info = store.data.BI[b.id] || {};
  const mat = bondView(b).mat; // วันครบกำหนดของรุ่นเดิม
  if (mat < today()) return toast('ตราสารครบกำหนดแล้ว Reopen ไม่ได้'), null;
  const id = nextBondId('DB');
  store.data.D.unshift({
    ...blankBond(id, 'Reopen ' + b.symbol, 'TPL-06'),
    co: store.session.co,
    sector: b.sector,
    kind: b.kind + ' (Reopen)',
    symbol: b.symbol,
    tenor: b.tenor,
    ro: b.id,
    add: addSize,
    rdate: date,
    rf: { mat, rate: info.rate },
  });
  logActivity(`สร้างคำขอ Reopen ${id} ของ ${b.id}`);
  toast('สร้าง ' + id + ' — แนบเอกสารให้ครบ');
  emit();
  return id;
}

/** โครงรายการเปล่า */
function blankBond(id: string, n: string, tp: string): Bond {
  return {
    id,
    n,
    co: store.session.co,
    tp,
    s: 'draft',
    v: 1,
    a: 0,
    note: '',
    date: '',
    sector: 'private',
    kind: 'หุ้นกู้',
    symbol: '',
    tenor: '3 ปี',
    termGroup: 'long',
    up: {},
  };
}

/** ส่งให้ Document ตรวจ */
export function sendToDocument(id: string): void {
  if (!canTouch(id)) return;
  find(id)!.s = 'submitted';
  logActivity('ส่งเอกสารให้ Document ' + id);
  toast('ส่งให้ Document แล้ว');
  emit();
}

/** แก้ไขชื่อรายการ (รายการที่ถูกส่งกลับจะกลับเป็นร่าง) */
export function editName(id: string): void {
  if (!canTouch(id)) return;
  ask('แก้ไขชื่อรายการ', find(id)!.n, (v) => {
    const d = find(id)!;
    d.n = v || d.n;
    if (d.s === 'returned') d.s = 'draft';
    logActivity('แก้ไข ' + id);
    toast('บันทึกแล้ว');
  });
}

/** แนบไฟล์ให้หัวข้อของ Template (รับเฉพาะ .zip / .pdf) */
export async function attachFile(id: string, nodeId: string, file: File): Promise<void> {
  if (!canTouch(id)) return;
  if (!/\.(zip|pdf)$/i.test(file.name)) return toast('แนบได้เฉพาะไฟล์ .zip หรือ .pdf');
  try {
    await setBlob(`${id}|${nodeId}`, file);
  } catch {
    return toast('บันทึกไฟล์แนบไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บแล้วลองใหม่');
  }
  const d = find(id)!;
  (d.up = d.up || {})[nodeId] = file.name;
  logActivity(`แนบเอกสาร ${id}`);
  toast('แนบแล้ว');
  emit();
}

export async function detachFile(id: string, nodeId: string): Promise<void> {
  if (!canTouch(id)) return;
  try {
    await deleteBlob(`${id}|${nodeId}`);
  } catch {
    return toast('ลบไฟล์แนบไม่สำเร็จ กรุณาลองใหม่');
  }
  delete find(id)!.up[nodeId];
  logActivity(`ลบไฟล์ ${id}`);
  emit();
}

/** ส่งใหม่ทั้งฉบับ (สำหรับรายการที่ถูกยกเลิก/ปฏิเสธ) — คืน id ใหม่ */
export function resubmit(id: string): string | null {
  if (!canTouch(id)) return null;
  const o = find(id)!;
  const nid = nextBondId(o.id.split('-')[0]);
  store.data.D.unshift({ ...o, id: nid, s: 'draft', up: {}, v: 1, a: 0, note: '', date: '' });
  logActivity(`ส่งใหม่ทั้งฉบับ ${o.id} → ${nid}`);
  toast('สร้าง ' + nid + ' — แนบเอกสารใหม่ทั้งชุด');
  emit();
  return nid;
}

/* ---------- ฟอร์มสร้างรายการตราสารหนี้ใหม่ ---------- */
export interface BondFormValues {
  sector: Sector;
  kind: string;
  tenorSpec: string; // "long|3 ปี"
  n: string;
  symbol: string;
  co: string;
  tp: string;
  iss: string;
  mat: string;
  reg: string;
  size: string;
  out: string;
  opt: string;
  sec: string;
  rep: string;
  regs: string;
  cd: string;
  ri: string;
  ria: string;
  rc: string;
  rca: string;
}

/** ตรวจความถูกต้องของฟอร์ม — คืนข้อความ error (ว่าง = ผ่าน) */
export function validateBondForm(v: BondFormValues): string {
  const n = v.n.trim();
  const symbol = v.symbol.trim().toUpperCase();
  const termGroup = v.tenorSpec.split('|')[0];
  const gov = GOVERNMENT_KINDS as readonly string[];

  if (v.sector === 'private' && v.kind !== 'หุ้นกู้') return 'ตราสารภาคเอกชนต้องใช้คำเรียก “หุ้นกู้”';
  if (v.sector === 'government' && !gov.includes(v.kind)) return 'กรุณาเลือกคำเรียกตราสารภาครัฐให้ถูกต้อง';
  if (v.sector === 'private' && !n.includes('หุ้นกู้')) return 'ชื่อเอกชนต้องมีคำว่า “หุ้นกู้”';
  if (v.sector === 'government' && !/(พันธบัตร|ตั๋วเงิน)/.test(n)) return 'ชื่อภาครัฐต้องมีคำว่า “พันธบัตร” หรือ “ตั๋วเงิน”';
  if (v.kind === 'ตั๋วเงินคลัง' && termGroup !== 'short') return 'ตั๋วเงินคลังต้องมีอายุไม่เกิน 1 ปี';
  if (['พันธบัตรรัฐบาล', 'พันธบัตรรัฐวิสาหกิจ'].includes(v.kind) && termGroup !== 'long') {
    return 'พันธบัตรต้องมีอายุตั้งแต่ 1 ปีขึ้นไป';
  }
  if (store.data.D.some((d) => d.symbol.toUpperCase() === symbol && !['cancelled', 'rejected'].includes(d.s))) {
    return 'Symbol นี้มีในระบบแล้ว';
  }
  if (v.mat && v.iss && v.mat <= v.iss) return 'Maturity Date ต้องอยู่หลัง Issue Date';
  if (+v.out > +v.size) return 'Outstanding ต้องไม่เกิน Issue Size';
  return '';
}

/**
 * สร้างรายการตราสารหนี้ใหม่
 * @param files    ชื่อไฟล์ที่แนบ (key = id หัวข้อ)
 * @param blobUrls Blob URL ของไฟล์ที่แนบ (key = id หัวข้อ)
 * @param submit   true = ส่งให้ Document ทันที
 */
export async function createBond(
  v: BondFormValues,
  files: Record<string, string>,
  blobUrls: Record<string, string>,
  submit: boolean,
): Promise<{ id: string } | { error: string }> {
  const error = validateBondForm(v);
  if (error) return { error };

  const [termGroup, tenor] = v.tenorSpec.split('|') as ['short' | 'long', string];
  const symbol = v.symbol.trim().toUpperCase();
  const prefix = v.sector === 'government' ? (v.kind === 'ตั๋วเงินคลัง' ? 'TB' : 'GB') : 'DB';
  const id = nextBondId(prefix);

  const valid = new Set(flatten(getTpl(v.tp).items).map((x) => x.id));
  const up: Record<string, string> = {};
  Object.keys(files).forEach((k) => {
    if (valid.has(k)) up[k] = files[k];
  });
  try {
    for (const k of Object.keys(blobUrls)) {
      if (valid.has(k)) await setBlob(`${id}|${k}`, blobUrls[k]);
    }
  } catch {
    return { error: 'บันทึกไฟล์แนบไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บแล้วลองใหม่' };
  }

  const g = (x: string) => x.trim();
  const num = (x: string) => (g(x) === '' ? null : +g(x));
  const rate = (a: string, b: string) => (g(a) ? g(a) + '/' + g(b) : '-');
  const info: Partial<BondInfo> = {
    iss: g(v.iss),
    mat: g(v.mat),
    reg: g(v.reg),
    size: num(v.size),
    out: num(v.out),
    opt: g(v.opt),
    sec: g(v.sec),
    rep: g(v.rep) || '-',
    regs: g(v.regs) || '-',
    cd: num(v.cd),
    ri: rate(v.ri, v.ria),
    rc: rate(v.rc, v.rca),
  };

  store.data.D.unshift({
    id,
    n: v.n.trim(),
    co: store.session.role === 'company' ? store.session.co : v.co,
    tp: v.tp,
    s: 'draft',
    up,
    v: 1,
    a: 0,
    note: '',
    date: '',
    sector: v.sector,
    kind: v.kind,
    symbol,
    tenor,
    termGroup,
    info,
  });
  logActivity(`สร้าง ${id} ${symbol} อายุ ${tenor}`);
  if (submit) {
    store.data.D[0].s = 'submitted';
    logActivity('ส่งเอกสารให้ Document ' + id);
  }
  toast(submit ? 'สร้าง ' + id + ' และส่งให้ Document แล้ว' : 'บันทึกร่าง ' + id + ' แล้ว');
  emit();
  return { id };
}

/* ============================================================
 *  Document (เจ้าหน้าที่ตรวจเอกสาร)
 * ============================================================ */

/** ส่งต่อ Manager (ต้องผ่าน Cross-check และเอกสารครบ) */
export function forwardToManager(id: string): void {
  const d = find(id)!;
  const x = crossCheck(d);
  if (x.length) return toast('Cross-check ไม่ผ่าน: ' + x.join(', ') + ' — กรุณาส่งกลับหรือปฏิเสธ');
  if (isIncomplete(d)) return toast('เอกสารยังไม่ครบตาม Template — ส่งต่อ Manager ไม่ได้');
  d.s = 'pending';
  logActivity('Document ส่งต่อ Manager ' + id);
  toast('ส่งต่อให้ Manager แล้ว');
  emit();
}

export function officerReturn(id: string): void {
  ask('เหตุผลที่ส่งกลับให้บริษัทแก้ไข', '', (v) => {
    const d = find(id)!;
    d.s = 'returned';
    d.note = v || '-';
    logActivity(`Document ส่งกลับ ${id}: ${d.note}`);
    toast('ส่งกลับแล้ว');
  }, true);
}

export function officerCancel(id: string): void {
  ask('เหตุผลที่ยกเลิกรายการ', '', (v) => {
    const d = find(id)!;
    d.s = 'cancelled';
    d.note = v || '-';
    logActivity(`Document ยกเลิก ${id}: ${d.note}`);
    toast('ยกเลิกแล้ว');
  }, true);
}

/* ============================================================
 *  Reviewer
 * ============================================================ */

/** ตรวจข้อมูลผ่าน → ส่งอนุมัติ */
export function reviewPass(id: string): void {
  find(id)!.s = 'approving';
  logActivity('ตรวจผ่าน ' + id);
  toast('ส่งต่อให้อนุมัติ');
  emit();
}

export function reviewReturn(id: string): void {
  ask('เหตุผลที่ส่งกลับ', '', (v) => {
    const d = find(id)!;
    d.s = 'returned';
    d.note = v || '-';
    logActivity(`ส่งกลับ ${id}: ${v}`);
    toast('ส่งกลับแล้ว');
  }, true);
}

/** ส่งกลับจากฟอร์ม "ส่งกลับเพื่อแก้ไข" */
export function returnWithReason(id: string, reason: string): void {
  const d = find(id);
  if (!d) return toast('ไม่มีเอกสาร');
  d.s = 'returned';
  d.note = reason;
  logActivity(`ส่งกลับ ${d.id}: ${d.note}`);
  toast('ส่งกลับแล้ว');
  emit();
}

export function approve(id: string): void {
  const d = find(id)!;
  const e = crossCheck(d);
  if (e.length) return toast('ไม่ผ่านการตรวจ: ' + e.join(', '));
  d.s = 'approved';
  logActivity('อนุมัติ ' + id);
  toast('อนุมัติแล้ว');
  emit();
}

export function reject(id: string): void {
  ask('เหตุผลที่ปฏิเสธ', '', (v) => {
    const d = find(id)!;
    d.s = 'rejected';
    d.note = v;
    logActivity(`ปฏิเสธ ${id}: ${v}`);
    toast('ปฏิเสธแล้ว');
  }, true);
}

/** เผยแพร่เอกสารฉบับปัจจุบัน (Version เดิมถูกเก็บเป็น Archive) */
export function publish(id: string): void {
  const d = find(id)!;
  const { BI, PG } = store.data;

  // Reopen: เพิ่มยอดให้ตราสารเดิม
  if (d.ro) {
    const b = find(d.ro)!;
    const x = BI[b.id] || (BI[b.id] = makeBondInfo(b));
    x.size = (+(x.size || 0)) + (d.add || 0);
    x.out = (+(x.out || 0)) + (d.add || 0);
    d.s = 'published';
    d.date = today();
    logActivity(`Reopen ${b.id} ${b.symbol} เพิ่ม ${nf(d.add)} ล้านบาท (วันที่ออก ${d.rdate}) จากคำขอ ${d.id}`);
    toast('Reopen: อัปเดตยอดใน ' + b.symbol + ' แล้ว');
    return emit();
  }

  if (d.v > 1 || d.a) d.a++;
  d.v++;
  if (d.pg) {
    const p = PG.find((x) => x.id === d.pg)!;
    p.used += d.size || 0;
    BI[d.id] = { size: d.size, out: d.size, iss: today() };
  } else if (!BI[d.id]) {
    BI[d.id] = makeBondInfo(d);
  }
  d.s = 'published';
  d.date = today();
  logActivity(`เผยแพร่ ${id} v${d.v}`);
  toast('เผยแพร่แล้ว');
  emit();
}

/* ============================================================
 *  Admin
 * ============================================================ */

/** ลบเอกสารที่เผยแพร่แล้ว (ต้องระบุสาเหตุ) */
export function deletePublished(id: string): void {
  const d = find(id);
  if (!d || d.s !== 'published') return;
  ask('เหตุผลที่ลบเอกสาร ' + d.id + ' (ต้องระบุ)', '', (v) => {
    v = (v || '').trim();
    if (!v) {
      toast('กรุณาระบุสาเหตุก่อนลบ');
      return deletePublished(id);
    }
    store.data.D.splice(store.data.D.indexOf(d), 1);
    store.data.DEL.unshift({
      t: fmtDT(new Date()),
      u: store.session.user?.n || '',
      id: d.id,
      n: d.n,
      reason: v,
    });
    logActivity(`ลบเอกสารที่เผยแพร่แล้ว ${d.id}: ${v}`);
    toast('ลบเอกสาร ' + d.id + ' แล้ว');
  }, true);
}
