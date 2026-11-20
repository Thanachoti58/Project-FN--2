'use client';
/** OREO (company) — ขอ Reopen ตราสารเดิม (ข้อมูลหลักของรุ่นเดิมล็อก กรอกได้เฉพาะส่วนเพิ่ม) */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { bondView, reopenable } from '@/store/selectors';
import { createReopen } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';

export function ReopenView() {
  const { data } = useStore();
  const router = useRouter();
  const [picked, setPicked] = useState('');
  const bases = reopenable();
  const b = bases.find((x) => x.id === picked) ?? bases[0];

  if (!b) {
    return (
      <PageShell view="oreo" hideDeck title="ขอ Reopen ตราสารเดิม">
        <p className="m-0 text-muted">ยังไม่มีตราสารที่เผยแพร่แล้ว</p>
      </PageShell>
    );
  }

  const info = bondView(b);
  const rate = data.BI[b.id]?.rate;
  const locked = (label: string, value: string | number) => (
    <Field label={label + ' (ล็อก)'}>
      <Input value={value} readOnly />
    </Field>
  );

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = createReopen(b.id, +String(f.get('a')), String(f.get('dt')));
    if (id) router.push('/oup?doc=' + id);
  };

  return (
    <PageShell view="oreo" title="ขอ Reopen ตราสารเดิม" subtitle="ข้อมูลหลักของรุ่นเดิมแก้ไขไม่ได้ กรอกได้เฉพาะส่วนเพิ่ม">
      <Card className="!max-w-[640px]">
        <Field label="เลือกตราสารเดิม">
          <Select value={b.id} onChange={(e) => setPicked(e.target.value)}>
            {bases.map((x) => (
              <option key={x.id} value={x.id}>{x.symbol + ' · ' + x.n}</option>
            ))}
          </Select>
        </Field>
        <form onSubmit={submit} className="mt-3.5">
          {locked('Symbol', b.symbol)}
          {locked('วันครบกำหนด', info.mat)}
          {locked('อัตราดอกเบี้ย (%)', rate == null ? '-' : rate)}
          {locked('Issue Size ปัจจุบัน (ล้านบาท)', info.size)}
          <Field label="มูลค่าที่เสนอขายเพิ่ม (ล้านบาท)"><Input name="a" type="number" min={1} required /></Field>
          <Field label="วันที่ออกส่วนเพิ่ม"><Input name="dt" type="date" required /></Field>
          <div><Button type="submit">สร้างคำขอ Reopen และแนบเอกสาร</Button></div>
        </form>
      </Card>
    </PageShell>
  );
}
