'use client';
/** ReceiveTable — ตารางเอกสารที่ส่งมารอ Document ตรวจ (ใช้ทั้งหน้าหลักและหน้า orecv) */
import { useStore } from '@/hooks/useStore';
import { byStatus, filesCount, getTpl, isIncomplete, need } from '@/store/selectors';
import { forwardToManager, officerCancel, officerReturn } from '@/store';
import { pct } from '@/lib/format';
import { BondTable } from '@/components/bond/BondTable';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Misc';

export function ReceiveTable() {
  useStore();
  return (
    <BondTable
      list={byStatus('submitted')}
      extra={[
        { header: 'ประเภท', render: (d) => (d.pg ? 'MTN รุ่นย่อย' : d.ro ? 'Reopen' : 'ปกติ') },
        { header: 'Template', render: (d) => `${getTpl(d.tp).n} (${need(d)} เอกสาร)` },
        {
          header: 'ได้รับ',
          render: (d) => (
            <>
              <ProgressBar value={pct(filesCount(d), need(d))} />
              {filesCount(d)}/{need(d)}
            </>
          ),
        },
        {
          header: 'จัดการ',
          render: (d) => (
            <>
              <Button disabled={isIncomplete(d)} onClick={() => forwardToManager(d.id)}>ส่งต่อ Manager</Button>
              <Button variant="outline" onClick={() => officerReturn(d.id)}>ส่งกลับแก้ไข</Button>
              <Button variant="danger" onClick={() => officerCancel(d.id)}>ยกเลิก</Button>
            </>
          ),
        },
      ]}
    />
  );
}
