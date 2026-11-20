'use client';
/** OEDIT (company) — บันทึกและแก้ไขข้อมูล: รายการที่เป็นร่าง/ถูกส่งกลับแก้ไขได้ */
import { useStore } from '@/hooks/useStore';
import { mine } from '@/store/selectors';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { CompanyRowActions } from './CompanyRowActions';

export function EditListView() {
  useStore();
  return (
    <PageShell view="oedit" title="บันทึกและแก้ไขข้อมูล" subtitle="รายการที่ถูกส่งกลับแก้ไขได้โดยใช้เอกสารและเทมเพลตเดิม">
      <BondTable
        list={mine()}
        extra={[
          { header: 'หมายเหตุ', render: (d) => d.note || '-' },
          { header: '', render: (d) => <CompanyRowActions bond={d} outline disabled={!['draft', 'returned'].includes(d.s)} /> },
        ]}
      />
    </PageShell>
  );
}
