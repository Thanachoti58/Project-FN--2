'use client';
/** OTRK (officer + company) — ติดตามสถานะ / ความคืบหน้าของเอกสาร */
import { FLOW } from '@/constants';
import { useStore } from '@/hooks/useStore';
import { scopeBonds } from '@/store/selectors';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';

export function TrackView() {
  useStore();
  return (
    <PageShell
      view="otrk"
      title="ตรวจสอบความคืบหน้า"
      subtitle="ร่าง → Document ตรวจ → Manager ตรวจ → อนุมัติ → รอเผยแพร่ → เผยแพร่"
    >
      <BondTable
        list={scopeBonds()}
        extra={[
          {
            header: 'ความคืบหน้า',
            render: (d) => (
              <div className="flex gap-1">
                {FLOW.map((f, j) => (
                  <i key={f} className={`h-1.5 w-[26px] rounded-[3px] ${j <= FLOW.indexOf(d.s) ? 'bg-accent' : 'bg-line'}`} />
                ))}
              </div>
            ),
          },
          { header: 'หมายเหตุ', render: (d) => d.note || '-' },
        ]}
      />
    </PageShell>
  );
}
