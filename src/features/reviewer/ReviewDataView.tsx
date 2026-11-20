'use client';
/** RDATA (reviewer) — ตรวจสอบข้อมูลตราสารหนี้ ผ่าน → ส่งอนุมัติ / ไม่ผ่าน → ส่งกลับ */
import { useStore } from '@/hooks/useStore';
import { byStatus } from '@/store/selectors';
import { reviewPass, reviewReturn } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { Button } from '@/components/ui/Button';

export function ReviewDataView() {
  useStore();
  return (
    <PageShell view="rdata" title="ตรวจสอบข้อมูลตราสารหนี้" subtitle="ตรวจผ่านเพื่อส่งอนุมัติ หรือส่งกลับพร้อมเหตุผล">
      <BondTable
        list={byStatus('pending')}
        extra={[
          {
            header: '',
            render: (d) => (
              <>
                <Button onClick={() => reviewPass(d.id)}>ตรวจผ่าน</Button>
                <Button variant="outline" onClick={() => reviewReturn(d.id)}>ส่งกลับ</Button>
              </>
            ),
          },
        ]}
      />
    </PageShell>
  );
}
