'use client';
/** RRET (reviewer) — ส่งกลับเพื่อแก้ไข (ต้องระบุเหตุผลทุกครั้ง) */
import { useState } from 'react';
import { STATUS } from '@/constants';
import { useStore } from '@/hooks/useStore';
import { filesCount, need } from '@/store/selectors';
import { returnWithReason } from '@/store';
import { pct } from '@/lib/format';
import { PageShell } from '@/components/ui/PageHeader';
import { Card, Chip } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Field, Select, Textarea } from '@/components/ui/Field';
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard';
import { ProgressBar } from '@/components/ui/Misc';

/** เหตุผลที่พบบ่อย (กดเพื่อเติมลงช่องเหตุผล) */
const COMMON_REASONS = [
  'เอกสารไม่ครบตาม Template',
  'ข้อมูลตราสารไม่ตรงกับเอกสารแนบ',
  'ขาดมติที่ประชุม',
  'อัตราดอกเบี้ย/วันครบกำหนดไม่ถูกต้อง',
  'ไฟล์แนบอ่านไม่ได้',
];

export function ReturnView() {
  const { data } = useStore();
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');

  const queue = data.D.filter((d) => ['pending', 'approving'].includes(d.s));
  const d = queue.find((x) => x.id === selected) ?? queue[0];
  const history = data.L.filter((l) => /ส่งกลับ/.test(l.a)).slice(0, 5);

  if (!d) {
    return (
      <PageShell view="rret" hideDeck title="ส่งกลับเพื่อแก้ไข" subtitle="ต้องระบุเหตุผลทุกครั้ง">
        <Card $wide>
          <p className="m-0 text-muted">ไม่มีเอกสารที่ส่งกลับได้ในขณะนี้</p>
        </Card>
      </PageShell>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    returnWithReason(d.id, reason);
    setReason('');
  };

  const kv = (k: string, v: React.ReactNode) => (
    <div>
      <small className="text-muted">{k}</small>
      <div>{v}</div>
    </div>
  );

  return (
    <PageShell view="rret" hideDeck title="ส่งกลับเพื่อแก้ไข" subtitle="ต้องระบุเหตุผลทุกครั้ง — บริษัทจะเห็นเหตุผลและแก้ไขแล้วส่งใหม่">
      <KpiGrid>
        <KpiCard label="เอกสารที่ส่งกลับได้" value={queue.length} color="#FBBF24" icon="list" />
        <KpiCard label="ส่งกลับล่าสุด" value={history.length} color="#F87171" icon="send" />
      </KpiGrid>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {/* ---------- ฟอร์ม ---------- */}
        <Card $wide>
          <h3>เลือกเอกสารและระบุเหตุผล</h3>
          <form onSubmit={submit}>
            <Field label="เอกสาร">
              <Select value={d.id} onChange={(e) => setSelected(e.target.value)}>
                {queue.map((x) => (
                  <option key={x.id} value={x.id}>{x.id + ' ' + x.n}</option>
                ))}
              </Select>
            </Field>
            <div className="my-3.5 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3 rounded-xl border border-line bg-surface p-3.5">
              {kv('สถานะ', <StatusBadge status={d.s} />)}
              {kv('ผู้ออก', d.co)}
              {kv('Symbol', d.symbol || '-')}
              {kv('อายุ', d.tenor)}
              <div className="col-span-full">
                <small className="text-muted">เอกสารแนบ {filesCount(d)}/{need(d)}</small>
                <ProgressBar value={pct(filesCount(d), need(d))} />
              </div>
            </div>
            <small className="text-muted">เลือกเหตุผลที่พบบ่อย</small>
            <div className="mb-3.5 mt-2 flex flex-wrap gap-2">
              {COMMON_REASONS.map((r) => (
                <Chip key={r} type="button" onClick={() => setReason((v) => (v ? v + ', ' : '') + r)}>{r}</Chip>
              ))}
            </div>
            <Field label="เหตุผล">
              <Textarea rows={4} required value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <div className="mt-3.5">
              <Button type="submit" variant="danger">ส่งกลับให้แก้ไข</Button>
            </div>
          </form>
        </Card>

        {/* ---------- คิว + ประวัติ ---------- */}
        <div>
          <Card $wide>
            <h3>คิวเอกสาร</h3>
            {queue.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setSelected(x.id)}
                className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border-0 border-b border-line px-2 py-2.5 text-left text-ink hover:bg-surface ${x.id === d.id ? 'bg-accent/10' : 'bg-transparent'}`}
              >
                <i className="mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: STATUS[x.s][1] }} />
                <div>
                  {x.id} · {x.symbol || x.n}
                  <small className="mt-0.5 block text-[11px] text-muted">{x.co} · {STATUS[x.s][0]}</small>
                </div>
              </button>
            ))}
          </Card>
          <Card $wide>
            <h3>ประวัติการส่งกลับล่าสุด</h3>
            {history.length ? (
              history.map((l, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-line py-2.5 last:border-0">
                  <i className="mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full bg-danger" />
                  <div>
                    {l.a}
                    <small className="mt-0.5 block text-[11px] text-muted">{l.t} · {l.u}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="m-0 text-muted">ยังไม่มี</p>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
