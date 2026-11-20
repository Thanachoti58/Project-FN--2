'use client';
/** APUB (admin) — เอกสารที่เผยแพร่แล้ว + ลบพร้อมระบุสาเหตุ + ประวัติการลบ */
import { useStore } from '@/hooks/useStore';
import { deletePublished } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Notice, SectionTitle } from '@/components/ui/Misc';

export function PublishedDocsView() {
  const { data } = useStore();
  return (
    <PageShell
      view="apub"
      title="เอกสารที่เผยแพร่แล้ว"
      subtitle="ลบเอกสารที่เผยแพร่แล้วได้ แต่ต้องระบุสาเหตุทุกครั้ง และระบบจะบันทึกไว้ในประวัติการลบ"
    >
      <Notice title="ข้อควรระวัง">การลบจะนำเอกสารออกจากระบบทันที ไม่สามารถกู้คืนได้</Notice>
      <BondTable
        list={data.D.filter((d) => d.s === 'published')}
        extra={[{ header: '', render: (d) => <Button variant="danger" onClick={() => deletePublished(d.id)}>ลบ</Button> }]}
      />
      <SectionTitle>ประวัติการลบ</SectionTitle>
      <DataTable
        headers={['วันที่และเวลา', 'ผู้ลบ', 'รหัส', 'ชื่อรายการ', 'สาเหตุ']}
        rows={data.DEL.map((x) => [x.t, x.u, x.id, x.n, x.reason])}
      />
    </PageShell>
  );
}
