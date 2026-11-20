'use client';
/** RAPP (reviewer) — อนุมัติหรือปฏิเสธเอกสาร (อนุมัติไม่ได้ถ้า Cross-check ไม่ผ่าน) */
import { useStore } from '@/hooks/useStore';
import { byStatus } from '@/store/selectors';
import { approve, reject } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { Button } from '@/components/ui/Button';

export function ApproveView() {
  useStore();
  return (
    <PageShell view="rapp" title="อนุมัติหรือปฏิเสธเอกสาร">
      <BondTable
        list={byStatus('approving')}
        extra={[
          {
            header: '',
            render: (d) => (
              <>
                <Button onClick={() => approve(d.id)}>อนุมัติ</Button>
                <Button variant="danger" onClick={() => reject(d.id)}>ปฏิเสธ</Button>
              </>
            ),
          },
        ]}
      />
    </PageShell>
  );
}
