'use client';
/** CTPL (company) — เลือกเทมเพลตเพื่อสร้างรายการตราสารหนี้ */
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { usableTemplates } from '@/store/selectors';
import { flatten } from '@/lib/tree';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TemplatePreview } from '@/components/template/TemplatePreview';

export function TemplatesView() {
  useStore();
  const router = useRouter();
  return (
    <PageShell view="ctpl" title="เทมเพลตเอกสาร" subtitle="เลือกเทมเพลตเพื่อสร้างรายการตราสารหนี้ — ต้องแนบไฟล์ให้ครบทุกหัวข้อ">
      <div className="grid gap-2.5">
        {usableTemplates().map((x) => (
          <Card key={x.id} $wide $flush>
            <b>{x.n}</b> <small className="text-muted">v{x.v} · {flatten(x.items).length} เอกสาร</small>
            <div className="my-3">
              <TemplatePreview items={x.items} />
            </div>
            <Button onClick={() => router.push('/onew?tpl=' + x.id)}>ใช้ Template นี้</Button>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
