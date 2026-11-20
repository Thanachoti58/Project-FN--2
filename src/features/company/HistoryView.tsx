'use client';
/** CHIST (company) — ประวัติการยื่นทั้งหมด + บันทึกกิจกรรม (ยกเลิก/ปฏิเสธ → ส่งใหม่ทั้งฉบับ) */
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { getTpl, mine } from '@/store/selectors';
import { resubmit } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { SectionTitle } from '@/components/ui/Misc';

export function HistoryView() {
  const { data } = useStore();
  const router = useRouter();
  const ids = mine().map((d) => d.id);
  return (
    <PageShell view="chist" title="ประวัติการยื่น" subtitle="รายการตราสารหนี้ที่เคยยื่นทั้งหมด — รายการที่ถูกยกเลิกต้องส่งใหม่ทั้งฉบับ">
      <BondTable
        list={mine()}
        extra={[
          { header: 'Template', render: (d) => getTpl(d.tp).n },
          { header: 'หมายเหตุ', render: (d) => d.note || '-' },
          {
            header: '',
            render: (d) =>
              ['cancelled', 'rejected'].includes(d.s) ? (
                <Button onClick={() => { const id = resubmit(d.id); if (id) router.push('/oup?doc=' + id); }}>ส่งใหม่ทั้งฉบับ</Button>
              ) : null,
          },
        ]}
      />
      <SectionTitle>บันทึกกิจกรรม</SectionTitle>
      <DataTable
        headers={['วันที่และเวลา', 'เหตุการณ์']}
        rows={data.L.filter((l) => ids.some((id) => l.a.includes(id))).map((l) => [l.t, l.a])}
      />
    </PageShell>
  );
}
