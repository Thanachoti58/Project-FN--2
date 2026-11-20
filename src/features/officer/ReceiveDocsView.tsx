'use client';
/** ORECV (officer) — ตรวจเอกสารที่ได้รับจากบริษัท */
import { useStore } from '@/hooks/useStore';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { SectionTitle } from '@/components/ui/Misc';
import { ReceiveTable } from './ReceiveTable';

export function ReceiveDocsView() {
  const { data } = useStore();
  return (
    <PageShell
      view="orecv"
      title="ตรวจเอกสารที่ได้รับ"
      subtitle="ตรวจจำนวนเอกสารตาม Template — ครบแล้วส่งต่อ Manager ได้ ไม่ครบให้ส่งกลับแก้ไข หรือยกเลิกหากดำเนินการต่อไม่ได้"
    >
      <ReceiveTable />
      <SectionTitle>ส่งกลับแก้ไข / ยกเลิกแล้ว</SectionTitle>
      <BondTable
        list={data.D.filter((d) => ['returned', 'cancelled'].includes(d.s))}
        extra={[{ header: 'เหตุผล', render: (d) => d.note || '-' }]}
      />
    </PageShell>
  );
}
