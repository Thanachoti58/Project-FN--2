'use client';
/** OUP (company) — แนบเอกสารที่ไม่ครบ / ที่ถูกส่งกลับแก้ไข แล้วส่งให้ Document */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { useQueryParam } from '@/hooks/useViewParams';
import { filesCount, getTpl, mine, need } from '@/store/selectors';
import { attachFile, detachFile, sendToDocument, toast } from '@/store';
import { pct } from '@/lib/format';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { ProgressBar } from '@/components/ui/Misc';
import { AttachTree } from './AttachTree';

export function UploadDocsView() {
  useStore();
  const router = useRouter();
  const docParam = useQueryParam('doc');
  const [picked, setPicked] = useState('');

  const list = mine().filter((d) => ['draft', 'returned'].includes(d.s));
  const d = list.find((x) => x.id === (picked || docParam)) ?? list[0];

  if (!d) {
    return (
      <PageShell view="oup" title="เอกสารที่ไม่ครบ/ส่งกลับแก้ไข">
        <p className="m-0 text-muted">ไม่มีรายการที่ต้องกรอกเอกสาร — สร้างรายการตราสารหนี้ก่อน</p>
      </PageShell>
    );
  }
  const t = getTpl(d.tp);

  return (
    <PageShell view="oup" title="เอกสารที่ไม่ครบ/ส่งกลับแก้ไข" subtitle="แนบไฟล์ zip / pdf ในแต่ละหัวข้อให้ครบ แล้วกดส่งให้ Document">
      <Card $wide>
        <Select value={d.id} onChange={(e) => setPicked(e.target.value)}>
          {list.map((y) => (
            <option key={y.id} value={y.id}>{y.id + ' · ' + y.n}</option>
          ))}
        </Select>
        <p className="my-2.5 text-muted">
          {d.symbol} · {d.kind} · อายุ {d.tenor} · Template: {t.n} v{t.v} · แนบแล้ว {filesCount(d)}/{need(d)}
          {d.note ? ' · หมายเหตุ: ' + d.note : ''}
        </p>
        <ProgressBar value={pct(filesCount(d), need(d))} />
      </Card>

      <AttachTree
        items={t.items}
        files={d.up || {}}
        blobKeyOf={(id) => `${d.id}|${id}`}
        onPick={(id, f) => attachFile(d.id, id, f)}
        onRemove={(id) => detachFile(d.id, id)}
        emptyLabel={<em className="text-xs not-italic text-muted">ยังไม่แนบ</em>}
      />

      <div className="mt-3.5">
        <Button variant="outline" onClick={() => { toast('บันทึกร่างแล้ว'); router.push('/oedit'); }}>บันทึกร่าง</Button>
        <Button onClick={() => sendToDocument(d.id)}>ส่งให้ Document</Button>
      </div>
    </PageShell>
  );
}
