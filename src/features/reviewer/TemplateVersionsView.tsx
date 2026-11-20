'use client';
/** TVER (reviewer) — ดู Archive และออก Version ใหม่ (ต้องกด "ต้องปรับปรุง" ก่อน) */
import { useStore } from '@/hooks/useStore';
import { openArchive, openVersionModal } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

export function TemplateVersionsView() {
  const { data } = useStore();
  return (
    <PageShell
      view="tver"
      title="จัดการเวอร์ชัน Template"
      subtitle={'ดู Archive ของ Version เก่า และออก Version ใหม่ — ต้องกด "ต้องปรับปรุง" ที่หน้าแก้ไข Template ก่อนจึงจะออก Version ใหม่ได้'}
    >
      <DataTable
        headers={['Template', 'Current', 'อัปเดตล่าสุด', 'Archive', 'ต้องปรับปรุง', '']}
        rows={data.T.map((t) => [
          t.n,
          'v' + t.v,
          t.verDate || '-',
          t.hist.length,
          t.upd ? <StatusBadge key="s" status="pending" label="ต้องปรับปรุง" /> : <span key="s" className="text-muted">ยังไม่ได้กด</span>,
          <span key="a">
            <Button variant="outline" disabled={!t.hist.length} onClick={() => openArchive(t.id)}>ดู Archive</Button>
            <Button disabled={!t.upd} onClick={() => openVersionModal(t.id)}>ออก Version ใหม่</Button>
          </span>,
        ])}
      />
    </PageShell>
  );
}
