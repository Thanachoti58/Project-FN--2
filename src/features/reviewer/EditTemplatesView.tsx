'use client';
/** TEDIT (reviewer) — เปลี่ยนชื่อ / เปิด-ปิด / ระบุว่าต้องปรับปรุง */
import { useStore } from '@/hooks/useStore';
import { renameTemplate, toggleNeedsUpdate, toggleTemplate } from '@/store';
import { flatten } from '@/lib/tree';
import { PageShell } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

export function EditTemplatesView() {
  const { data } = useStore();
  return (
    <PageShell view="tedit" title="แก้ไข Template" subtitle="เปลี่ยนชื่อ เปิด/ปิด และระบุว่าต้องปรับปรุง">
      <DataTable
        headers={['รหัส', 'ชื่อ', 'รายการ', 'Version', 'สถานะ', '']}
        rows={data.T.map((t) => [
          t.id,
          t.n,
          flatten(t.items).length,
          'v' + t.v,
          t.upd ? <StatusBadge key="s" status="pending" label="ต้องปรับปรุง" /> : t.on ? <StatusBadge key="s" status="published" label="เปิดใช้งาน" /> : <StatusBadge key="s" status="draft" label="ปิดใช้งาน" />,
          <span key="a">
            <Button variant="outline" onClick={() => renameTemplate(t.id)}>เปลี่ยนชื่อ Template</Button>
            <Button variant="outline" onClick={() => toggleTemplate(t.id)}>{t.on ? 'ปิด' : 'เปิด'}</Button>
            <Button variant="outline" onClick={() => toggleNeedsUpdate(t.id)}>{t.upd ? 'เสร็จแล้ว' : 'ต้องปรับปรุง'}</Button>
          </span>,
        ])}
      />
    </PageShell>
  );
}
