'use client';
/** RATT (reviewer) — ตรวจเอกสารแนบเทียบกับรายการใน Template ทุกหัวข้อ */
import { useStore } from '@/hooks/useStore';
import { byStatus, filesCount, getTpl, need } from '@/store/selectors';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DocChecklist } from '@/components/template/DocChecklist';

export function ReviewAttachmentsView() {
  useStore();
  const list = byStatus('pending');
  return (
    <PageShell view="ratt" title="ตรวจสอบเอกสารแนบ" subtitle="เทียบกับรายการใน Template ทุกหัวข้อ">
      <div className="grid gap-2.5">
        {list.length ? (
          list.map((d) => (
            <Card key={d.id} $wide $flush>
              <b>
                {d.id} · {d.n}
              </b>{' '}
              <small className="text-muted">
                {d.co} · {getTpl(d.tp).n} · แนบแล้ว {filesCount(d)}/{need(d)}
              </small>
              <DocChecklist bond={d} className="mt-3" />
            </Card>
          ))
        ) : (
          <p className="m-0 text-muted">ไม่มีรายการรอตรวจสอบ</p>
        )}
      </div>
    </PageShell>
  );
}
