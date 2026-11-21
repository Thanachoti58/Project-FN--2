'use client';
/**
 * HOME — หน้าหลักของทุกบทบาท
 *  hero + KPI + การ์ดเฉพาะบทบาท + กิจกรรมล่าสุด + ตารางงานของบทบาทนั้น
 */
import { useRouter } from 'next/navigation';
import type { Status } from '@/types';
import type { IconName } from '@/components/ui/Icon';
import { IN_REVIEW, ROLES, STATUS } from '@/constants';
import { useStore } from '@/hooks/useStore';
import { byStatus, crossCheck, isIncomplete, mine, scopeBonds } from '@/store/selectors';
import { nf, today } from '@/lib/format';
import { resubmit } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard';
import { BondTable } from '@/components/bond/BondTable';
import { CompanyRowActions } from '@/features/company/CompanyRowActions';
import { ReceiveTable } from '@/features/officer/ReceiveTable';
import { LogTable } from './LogTable';

const G = '#2FE6A6';
type Tile = [label: string, value: number, view: string, color: string, icon: IconName];

/** แถวรายการแบบจุดสี + ข้อความ + ข้อความรอง */
function FeedRow({ title, sub, color = G }: { title: React.ReactNode; sub: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-line py-2.5 last:border-0">
      <i className="mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: color }} />
      <div>
        {title}
        <small className="mt-0.5 block text-[11px] text-muted">{sub}</small>
      </div>
    </div>
  );
}

/** แถบแนวนอนแสดงสัดส่วน */
function BarRow({ label, value, total, color }: { label: React.ReactNode; value: number; total: number; color: string }) {
  return (
    <div className="my-2.5 grid grid-cols-[150px_1fr_34px] items-center gap-2.5 text-[13px]">
      <span>{label}</span>
      <i className="h-2.5 overflow-hidden rounded-[9px] bg-line">
        <u className="block h-full rounded-[9px]" style={{ width: `${(value / Math.max(1, total)) * 100}%`, background: color }} />
      </i>
      <b className="text-right">{value}</b>
    </div>
  );
}

export function HomeView() {
  const { session, data } = useStore();
  const router = useRouter();
  const role = session.role;
  const rc = ROLES[role];
  const scope = scopeBonds();
  const n = (s: Status) => scope.filter((d) => d.s === s).length;
  const submitted = byStatus('submitted');

  /* ---------- KPI ตามบทบาท ---------- */
  const tiles: Record<typeof role, Tile[]> = {
    admin: [
      ['พนักงาน', data.U.filter((u) => u.r !== 'company').length, 'users', '#38BDF8', 'user'],
      ['ผู้ใช้บริษัท', data.U.filter((u) => u.r === 'company').length, 'users', '#A78BFA', 'building'],
      ['เปิดใช้งานอยู่', data.U.filter((u) => u.on).length, 'users', G, 'check'],
      ['เอกสารในระบบ', data.D.length, 'apub', '#A78BFA', 'file'],
      ['เผยแพร่แล้ว', n('published'), 'apub', G, 'up'],
      ['ส่งกลับแก้ไข', n('returned'), 'log', '#F87171', 'clock'],
    ],
    officer: [
      ['รอตรวจ', submitted.length, 'orecv', '#38BDF8', 'list'],
      ['พร้อมส่ง Manager', submitted.filter((d) => !isIncomplete(d) && !crossCheck(d).length).length, 'orecv', G, 'check'],
      ['ไม่ครบ / Cross-check ไม่ผ่าน', submitted.filter((d) => isIncomplete(d) || crossCheck(d).length).length, 'orecv', '#FB923C', 'clock'],
      ['ส่งกลับแก้ไข', n('returned'), 'otrk', '#F87171', 'send'],
      ['ยกเลิก', n('cancelled'), 'otrk', '#94A3B8', 'file'],
    ],
    company: [
      ['รายการทั้งหมด', scope.length, 'chist', '#38BDF8', 'list'],
      ['กำลังจัดทำ', n('draft'), 'oedit', '#A78BFA', 'file'],
      ['อยู่ระหว่างตรวจสอบ', IN_REVIEW.reduce((a, s) => a + n(s), 0), 'otrk', '#FBBF24', 'clock'],
      ['ถูกส่งกลับแก้ไข', n('returned'), 'oup', '#F87171', 'send'],
      ['เผยแพร่แล้ว', n('published'), 'chist', G, 'up'],
    ],
    manager: [
      ['รอ Manager ตรวจ', n('pending'), 'rdata', '#38BDF8', 'check'],
      ['รออนุมัติ', n('approving'), 'rapp', '#FBBF24', 'list'],
      ['รอเผยแพร่', n('approved'), 'rpub', '#A78BFA', 'up'],
      ['เผยแพร่แล้ว', n('published'), 'rpub', G, 'file'],
      ['ส่งกลับแก้ไข', n('returned'), 'rret', '#F87171', 'send'],
    ],
  };

  /* ---------- กิจกรรมล่าสุด ---------- */
  const feed = data.L.filter(
    (l) => role !== 'company' || data.U.some((u) => u.r === 'company' && u.co === session.co && u.n === l.u),
  ).slice(0, 6);

  /* ---------- การ์ดเฉพาะบทบาท ---------- */
  let sideTitle = '';
  let side: React.ReactNode = null;
  if (role === 'admin') {
    sideTitle = 'พนักงาน';
    const staff = data.U.filter((u) => u.r !== 'company');
    side = (
      <>
        {(['admin', 'officer', 'manager'] as const).map((k) => (
          <BarRow key={k} label={ROLES[k].name} value={staff.filter((u) => u.r === k).length} total={staff.length} color={G} />
        ))}
      </>
    );
  } else if (role === 'officer') {
    sideTitle = 'เอกสารที่ต้องจัดการ';
    side = submitted.length ? (
      submitted.slice(0, 5).map((d) => {
        const x = crossCheck(d);
        const bad = x.length > 0 || isIncomplete(d);
        return <FeedRow key={d.id} title={`${d.symbol} · ${d.n}`} sub={x.join(' / ') || (isIncomplete(d) ? 'เอกสารไม่ครบ' : 'พร้อมส่งต่อ Manager')} color={bad ? '#FB923C' : G} />;
      })
    ) : (
      <p className="m-0 text-muted">ไม่มีเอกสารรอตรวจ</p>
    );
  } else if (role === 'company') {
    sideTitle = 'วงเงินโครงการ MTN';
    const ps = data.PG.filter((p) => p.co === session.co);
    side = ps.length ? (
      ps.map((p) => (
        <div key={p.id} className="my-3">
          <div className="flex justify-between text-[13px]">
            <span>{p.n}</span>
            <span className="text-muted">{nf(p.used)} / {nf(p.limit)} ล้านบาท</span>
          </div>
          <BarRow label="" value={p.used} total={p.limit} color={p.exp < today() ? '#F87171' : G} />
          <small className="text-muted">หมดอายุ {p.exp}</small>
        </div>
      ))
    ) : (
      <p className="m-0 text-muted">ยังไม่มีโครงการ MTN</p>
    );
  } else {
    sideTitle = 'คิวรอดำเนินการ';
    const q = data.D.filter((d) => ['pending', 'approving', 'approved'].includes(d.s)).slice(0, 6);
    side = q.length ? q.map((d) => <FeedRow key={d.id} title={`${d.symbol} · ${d.n}`} sub={<StatusBadge status={d.s} />} color={STATUS[d.s][1]} />) : <p className="m-0 text-muted">ไม่มีรายการรอ</p>;
  }

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-line bg-[radial-gradient(120%_160%_at_100%_0,rgba(47,230,166,.22),transparent_55%),linear-gradient(135deg,#0E2F2B,#0E2624)] px-7 py-6">
        <div>
          <small className="text-muted">{new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}</small>
          <h2 className="my-1 text-[26px]">{session.user?.n}</h2>
          <p className="m-0 text-muted">
            {role === 'company' ? session.co + ' · ' : ''}
            {rc.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {rc.quickActions.map((a, i) => (
            <Button key={a.view} variant={i ? 'outline' : 'primary'} onClick={() => router.push('/' + a.view)}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ---------- KPI ---------- */}
      <KpiGrid>
        {tiles[role].map(([label, value, view, color, icon]) => (
          <KpiCard key={label} label={label} value={value} color={color} icon={icon} onClick={() => router.push('/' + view)} />
        ))}
      </KpiGrid>

      {/* ---------- การ์ดเฉพาะบทบาท ---------- */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        <Card $wide>
          <h3>{sideTitle}</h3>
          {side}
        </Card>
      </div>
      {role === 'admin' && (
        <Card $wide>
          <h3>กิจกรรมล่าสุด</h3>
          {feed.length ? feed.map((l, i) => <FeedRow key={i} title={l.a} sub={`${l.t} · ${l.u}`} />) : <p className="m-0 text-muted">ยังไม่มีกิจกรรม</p>}
        </Card>
      )}

      {/* ---------- ตารางงานของบทบาท ---------- */}
      <RoleTable />
    </div>
  );
}

/** ตารางท้ายหน้าหลักของแต่ละบทบาท */
function RoleTable() {
  const { session, data } = useStore();
  const router = useRouter();
  switch (session.role) {
    case 'admin':
      return (
        <>
          <h3>ประวัติการเข้าใช้งานล่าสุด</h3>
          <LogTable />
        </>
      );
    case 'officer':
      return (
        <>
          <h3>เอกสารที่รอตรวจ</h3>
          <ReceiveTable />
        </>
      );
    case 'company':
      return (
        <>
          <h3>รายการที่ต้องดำเนินการ</h3>
          <BondTable
            list={mine().filter((d) => ['returned', 'cancelled', 'rejected'].includes(d.s))}
            extra={[
              { header: 'หมายเหตุ', render: (d) => d.note || '-' },
              {
                header: '',
                render: (d) =>
                  d.s === 'returned' ? (
                    <CompanyRowActions bond={d} />
                  ) : (
                    <Button onClick={() => { const id = resubmit(d.id); if (id) router.push('/oup?doc=' + id); }}>ส่งใหม่ทั้งฉบับ</Button>
                  ),
              },
            ]}
          />
        </>
      );
    default:
      return (
        <>
          <h3>รอตรวจสอบ</h3>
          <BondTable list={data.D.filter((d) => d.s === 'pending')} extra={[{ header: '', render: () => <Button onClick={() => router.push('/rdata')}>ตรวจ</Button> }]} />
        </>
      );
  }
}
