'use client';
/** RPUB (reviewer) — เผยแพร่เอกสารฉบับปัจจุบัน (Version เดิมเก็บเป็น Archive) */
import { useStore } from '@/hooks/useStore';
import { publish } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { Button } from '@/components/ui/Button';

export function PublishView() {
  const { data } = useStore();
  return (
    <PageShell view="rpub" title="เผยแพร่เอกสารฉบับปัจจุบัน" subtitle="Version เดิมจะถูกเก็บเป็น Archive">
      <BondTable
        list={data.D.filter((d) => ['approved', 'published'].includes(d.s))}
        extra={[
          { header: 'Archive', render: (d) => d.a },
          { header: '', render: (d) => (d.s === 'approved' ? <Button onClick={() => publish(d.id)}>เผยแพร่</Button> : '-') },
        ]}
      />
    </PageShell>
  );
}
