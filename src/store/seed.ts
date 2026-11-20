/**
 * ============================================================
 *  SEED — ข้อมูลตัวอย่างเริ่มต้นของระบบ (Template / ตราสาร / ผู้ใช้ / Log)
 * ============================================================
 */
import type { AppData, Bond, BondInfo, Status, Template, TreeNode, User } from '@/types';
import { addTenor, todayAt } from '@/lib/format';
import { cloneTree } from '@/lib/tree';

export const COMPANIES = ['บริษัท xxx จำกัด', 'บริษัท yyy จำกัด'];

export function createSeed(): AppData {
  let nid = 100;
  const N = (t: string, c: TreeNode[] = []): TreeNode => ({ id: 'n' + ++nid, t, c });

  /* ---------------- Templates ---------------- */
  const T: Template[] = [
    {
      id: 'TPL-01',
      n: 'Template หุ้นกู้เอกชน',
      items: [
        N('หนังสือชี้ชวน', [N('ฉบับร่างหนังสือชี้ชวน'), N('เอกสารสรุปข้อมูลสำคัญ (Fact Sheet)')]),
        N('งบการเงิน', [N('งบการเงินรายปีล่าสุด'), N('งบการเงินไตรมาสล่าสุด')]),
        N('หนังสือรับรอง', [N('หนังสือรับรองนิติบุคคล'), N('รายชื่อกรรมการและผู้ถือหุ้น')]),
        N('มติที่ประชุม', [N('มติที่ประชุมคณะกรรมการ'), N('มติที่ประชุมผู้ถือหุ้น')]),
        N('สัญญา', [N('ข้อกำหนดสิทธิ'), N('สัญญาแต่งตั้งผู้แทนผู้ถือหุ้นกู้')]),
      ],
      on: true,
      v: 2,
      arch: 1,
      upd: false,
      hist: [],
      verDate: '2026-02-01',
    },
    {
      id: 'TPL-04',
      n: 'Template พันธบัตรรัฐบาล',
      items: [
        N('ประกาศกระทรวงการคลัง', [N('ประกาศการออกพันธบัตร')]),
        N('หนังสือชี้ชวน', [N('หนังสือชี้ชวนฉบับหลัก'), N('ภาคผนวก')]),
        N('ผลการประมูล', [N('รายงานผลการประมูล')]),
        N('ข้อมูล ISIN', [N('หนังสือขอรหัส ISIN')]),
      ],
      on: true,
      v: 1,
      arch: 0,
      upd: false,
      hist: [],
      verDate: '2026-02-01',
    },
  ];

  // TPL-01 มี Version 1 เก็บเป็น Archive แล้ว (ตัดหัวข้อสุดท้ายออก)
  T[0].hist.push({
    v: 1,
    n: T[0].n,
    items: cloneTree(T[0].items).slice(0, -1),
    date: '2026-02-01',
    note: 'Version แรก',
  });
  T[0].arch = 1;

  T.push(
    {
      id: 'TPL-05',
      n: 'Template MTN (รุ่นย่อย)',
      items: [
        N('เอกสารโครงการ MTN', [N('เอกสารอนุมัติโครงการ MTN หลัก'), N('ข้อมูลวงเงินรวมและระยะเวลาโครงการ')]),
        N('เอกสารรุ่นย่อย', [N('Filing รุ่นย่อย'), N('ข้อกำหนดสิทธิรุ่นย่อย')]),
      ],
      on: true,
      v: 1,
      arch: 0,
      upd: false,
      hist: [],
      verDate: '2026-02-01',
    },
    {
      id: 'TPL-06',
      n: 'Template Reopen',
      items: [N('หนังสือแจ้งผลการขายส่วนเพิ่ม'), N('ราคา/Yield วันที่ Reopen')],
      on: true,
      v: 1,
      arch: 0,
      upd: false,
      hist: [],
      verDate: '2026-02-01',
    },
  );

  /* ---------------- ตราสารหนี้ ---------------- */
  type Meta = Partial<Bond>;
  /** สร้างรายการตัวอย่างโดยไม่สร้างชื่อไฟล์แนบปลอม */
  const mk = (
    id: string,
    n: string,
    tp: string,
    s: Status,
    _fileCount: number,
    v = 1,
    a = 0,
    note = '',
    date = '',
    meta: Meta = {},
  ): Bond => {
    const up: Record<string, string> = {};
    return {
      id,
      n,
      co: COMPANIES[0],
      tp,
      s,
      v,
      a,
      note,
      date,
      sector: 'private',
      kind: 'หุ้นกู้',
      symbol: '',
      tenor: '3 ปี',
      termGroup: 'long',
      up,
      ...meta,
    };
  };
  const yyy = { co: COMPANIES[1] };
  const gov = { sector: 'government' as const };

  const BI: AppData['BI'] = {
    'DB-006': { rate: 3.5, iss: '2025-12-18', reg: '2025-12-22', size: 2000, out: 2000, opt: '', sec: 'UNSECURE', rep: 'ธนาคารกรุงไทย (KTB)', regs: 'ธนาคารกรุงเทพ (BBL)', cd: 1500, ri: 'AA-/TRIS', rc: 'AA-/TRIS' },
    'DB-011': { rate: 4.1, iss: '2026-01-15', reg: '2026-01-20', size: 1500, out: 1500, opt: 'Callable', sec: 'UNSECURE', rep: 'ธนาคารกรุงไทย (KTB)', regs: 'ธนาคารกรุงเทพ (BBL)', cd: 1000, ri: 'A+/TRIS', rc: 'A+/TRIS' },
    'GB-001': { iss: '2026-02-20', reg: '2026-02-23', size: 50000, out: 50000, opt: '', sec: 'UNSECURE', rep: '-', regs: 'ธนาคารแห่งประเทศไทย (BOT)', cd: null, ri: '-', rc: '-' },
    'SE-001': { iss: '2026-02-25', reg: '2026-02-27', size: 10000, out: 10000, opt: '', sec: 'UNSECURE', rep: '-', regs: 'ธนาคารแห่งประเทศไทย (BOT)', cd: null, ri: 'AAA/TRIS', rc: 'AAA/TRIS' },
    'TB-001': { iss: '2026-03-01', reg: '2026-03-03', size: 30000, out: 30000, opt: '', sec: 'UNSECURE', rep: '-', regs: 'ธนาคารแห่งประเทศไทย (BOT)', cd: null, ri: '-', rc: '-' },
  };

  const D: Bond[] = [
    // รายการที่ยื่นผ่านขั้นตอนพิเศษ (MTN / Reopen) อยู่บนสุด
    { ...mk('DB-012', 'MTN xxx รุ่นที่ 1', 'TPL-05', 'submitted', 0), kind: 'MTN', symbol: 'XXX31MA', tenor: '3 ปี', pg: 'MTN-01', size: 1500 },
    {
      ...mk('DB-013', 'Reopen XXX28DA', 'TPL-06', 'submitted', 0),
      kind: 'หุ้นกู้ (Reopen)',
      symbol: 'XXX28DA',
      tenor: '5 ปี',
      ro: 'DB-006',
      add: 500,
      rdate: '2026-12-01',
      // อัตราดอกเบี้ยในเอกสาร (3.75) ไม่ตรงกับรุ่นเดิม (3.5) — เพื่อสาธิต Cross-check
      rf: { mat: addTenor(BI['DB-006'].iss as string, '5 ปี'), rate: 3.75 },
    },
    // โครงการ MTN-02 หมดอายุแล้ว — เพื่อสาธิต Cross-check
    { ...mk('DB-014', 'MTN xxx ปี 2567 รุ่นที่ 2', 'TPL-05', 'submitted', 0), kind: 'MTN', symbol: 'XXX30MB', tenor: '3 ปี', pg: 'MTN-02', size: 500 },

    mk('DB-001', 'หุ้นกู้บริษัท xxx ครั้งที่ 1/2569', 'TPL-01', 'draft', 3, 1, 0, '', '', { symbol: 'XXX29AA', tenor: '270 วัน', termGroup: 'short' }),
    mk('DB-002', 'หุ้นกู้บริษัท xxx ครั้งที่ 2/2569', 'TPL-01', 'pending', 5, 1, 0, '', '', { symbol: 'XXX29AB', tenor: '5 ปี' }),
    mk('DB-003', 'หุ้นกู้บริษัท xxx ครั้งที่ 3/2569', 'TPL-01', 'approving', 5, 1, 0, '', '', { symbol: 'XXX30AA', tenor: '7 ปี' }),
    mk('DB-004', 'หุ้นกู้บริษัท xxx ครั้งที่ 4/2569', 'TPL-01', 'returned', 4, 1, 0, 'ขาดมติที่ประชุม', '', { symbol: 'XXX30AB', tenor: '10 ปี' }),
    mk('DB-005', 'หุ้นกู้บริษัท xxx ครั้งที่ 5/2569', 'TPL-01', 'approved', 5, 1, 0, '', '', { symbol: 'XXX31AA', tenor: '15 ปี' }),
    mk('DB-006', 'หุ้นกู้บริษัท xxx ครั้งที่ 6/2568', 'TPL-01', 'published', 5, 2, 1, '', '2025-12-18', { symbol: 'XXX28DA', tenor: '5 ปี' }),
    mk('DB-007', 'หุ้นกู้บริษัท xxx ครั้งที่ 7/2569', 'TPL-01', 'submitted', 5, 1, 0, '', '', { symbol: 'XXX31AB', tenor: '5 ปี' }),
    mk('DB-008', 'หุ้นกู้บริษัท xxx ครั้งที่ 8/2569', 'TPL-01', 'submitted', 3, 1, 0, '', '', { symbol: 'XXX32AA', tenor: '3 ปี' }),
    mk('DB-009', 'หุ้นกู้บริษัท xxx ครั้งที่ 9/2569', 'TPL-01', 'cancelled', 4, 1, 0, 'เอกสารไม่ถูกต้อง ต้องยื่นใหม่ทั้งฉบับ', '', { symbol: 'XXX32AB', tenor: '7 ปี' }),
    mk('DB-010', 'หุ้นกู้บริษัท yyy ครั้งที่ 1/2569', 'TPL-01', 'submitted', 5, 1, 0, '', '', { ...yyy, symbol: 'YYY29AA', tenor: '3 ปี' }),
    mk('DB-011', 'หุ้นกู้บริษัท yyy ครั้งที่ 2/2568', 'TPL-01', 'published', 5, 1, 0, '', '2026-01-15', { ...yyy, symbol: 'YYY28AA', tenor: '5 ปี' }),
    mk('GB-001', 'พันธบัตรรัฐบาล รุ่น LB346A', 'TPL-04', 'published', 4, 1, 0, '', '2026-02-20', { ...gov, co: 'กระทรวงการคลัง', kind: 'พันธบัตรรัฐบาล', symbol: 'LB346A', tenor: '10 ปี' }),
    mk('SE-001', 'พันธบัตรรัฐวิสาหกิจ การไฟฟ้าส่วนภูมิภาค', 'TPL-04', 'published', 4, 1, 0, '', '2026-02-25', { ...gov, co: 'การไฟฟ้าส่วนภูมิภาค', kind: 'พันธบัตรรัฐวิสาหกิจ', symbol: 'PEA31NA', tenor: '5 ปี' }),
    mk('TB-001', 'ตั๋วเงินคลัง รุ่นที่ 1/2569', 'TPL-04', 'published', 4, 1, 0, '', '2026-03-01', { ...gov, co: 'กระทรวงการคลัง', kind: 'ตั๋วเงินคลัง', symbol: 'B26M1', tenor: '6 เดือน', termGroup: 'short' }),
  ];

  /* ---------------- ผู้ใช้ ---------------- */
  const U: User[] = [
    { n: 'ธนโชติ แก้วชูฟอง', email: 'admin', r: 'admin', on: true, mail: 'thanachot.k@mbond.co.th' },
    { n: 'ภาคิน แซ่สือ', email: 'manager', r: 'manager', on: true, mail: 'pakin.s@mbond.co.th' },
    { n: 'ชญามิน อาวรวาน', email: 'document', r: 'officer', on: true, mail: 'chayamin.a@mbond.co.th' },
    { n: 'ธนธรณ์ ตั๊งสมบูรณ์', email: 'user', r: 'company', co: COMPANIES[0], on: true, mail: 'thanathon.t@xxx.co.th' },
    { n: 'อนุทัน ฉานฉลาด', email: 'user2', r: 'company', co: COMPANIES[1], on: true, mail: 'manee@yyy.co.th' },
    { n: 'พิสิษฐ์ กาญจนเรืองเด่น', email: 'manager2', r: 'manager', on: true, mail: 'phisit.k@mbond.co.th' },
    { n: 'อนุชา ใหม่', email: 'document2', r: 'officer', on: false, mail: 'anucha.m@mbond.co.th' },
  ];

  return {
    D,
    T,
    U,
    BI,
    CO: [...COMPANIES],
    DEL: [],
    NID: nid,
    PG: [
      { id: 'MTN-01', co: COMPANIES[0], n: 'โครงการ MTN xxx ปี 2569', limit: 10000, used: 2000, exp: '2028-03-31' },
      { id: 'MTN-02', co: COMPANIES[0], n: 'โครงการ MTN xxx ปี 2567', limit: 5000, used: 1000, exp: '2026-06-30' },
    ],
    L: [
      { t: todayAt(10, 5), u: 'พิสิษฐ์ กาญจนเรืองเด่น', a: 'ส่งกลับ DB-004: ขาดมติที่ประชุม', c: 'doc' },
      { t: todayAt(9, 50), u: 'ธนธรณ์ ตั๊งสมบูรณ์', a: 'ส่งเอกสาร DB-012 ให้ Document', c: 'doc' },
      { t: todayAt(9, 40), u: 'ภาคิน แซ่สือ', a: 'ออก Version ใหม่ TPL-01', c: 'tpl' },
      { t: todayAt(9, 12), u: 'ชญามิน อาวรวาน', a: 'ส่งตรวจ DB-002', c: 'doc' },
      { t: todayAt(9, 5), u: 'อนุทัน ฉานฉลาด', a: 'เข้าสู่ระบบ', c: 'sys' },
      { t: todayAt(8, 45), u: 'ธนธรณ์ ตั๊งสมบูรณ์', a: 'สร้างรายการตราสารหนี้ DB-013', c: 'doc' },
      { t: '18 ธ.ค. 2568 16:40', u: 'พิสิษฐ์ กาญจนเรืองเด่น', a: 'เผยแพร่ DB-006 v2', c: 'doc' },
    ],
    INV: [{ email: 'somchai@xxx.co.th', rep: 'สมชาย ผู้แทน xxx', co: COMPANIES[0], t: todayAt(8, 30) }],
  };
}

export type { BondInfo };
