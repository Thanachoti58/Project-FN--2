'use client';
/** OSEND (company) — ส่งเอกสารให้ Document ตรวจความครบถ้วนตาม Template */
import { useStore } from '@/hooks/useStore';
import { isIncomplete, mine } from '@/store/selectors';
import { sendToDocument } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { BondTable } from '@/components/bond/BondTable';
import { Button } from '@/components/ui/Button';

export function SendView() {
  useStore();
  return (
    <PageShell view="osend" title="ส่งเอกสารให้ Document" subtitle="Document จะตรวจความครบถ้วนตาม Template ก่อนส่งต่อ Manager">
      <BondTable
        list={mine().filter((d) => ['draft', 'returned'].includes(d.s))}
        extra={[
          {
            header: '',
            render: (d) => (
              <Button onClick={() => sendToDocument(d.id)}>
                {isIncomplete(d) ? 'ส่งให้ Document (ยังไม่ครบ)' : 'ส่งให้ Document'}
              </Button>
            ),
          },
        ]}
      />
    </PageShell>
  );
}
