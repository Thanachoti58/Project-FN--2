'use client';
/** ArchiveModal — ดู Version เก่าของ Template (อ่านอย่างเดียว) */
import { closeArchive, selectArchiveVersion } from '@/store';
import { getTpl } from '@/store/selectors';
import { flatten } from '@/lib/tree';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { TemplatePreview } from '@/components/template/TemplatePreview';

export function ArchiveModal({ id, version }: { id: string; version: number }) {
  const t = getTpl(id);
  const h = t.hist.find((x) => x.v === version) ?? t.hist[t.hist.length - 1];
  if (!h) return null;
  return (
    <Modal maxWidth={640}>
      <h3>Archive · {t.n}</h3>
      <Select value={h.v} onChange={(e) => selectArchiveVersion(+e.target.value)}>
        {t.hist.map((x) => (
          <option key={x.v} value={x.v}>
            v{x.v} · เก็บเมื่อ {x.date}
          </option>
        ))}
      </Select>
      <p className="my-2.5 text-muted">
        {h.n} · {flatten(h.items).length} รายการ{h.note ? ' · ' + h.note : ''} · อ่านอย่างเดียว
      </p>
      <TemplatePreview items={h.items} />
      <div className="mt-3.5 text-right">
        <Button variant="outline" onClick={closeArchive}>
          ปิด
        </Button>
      </div>
    </Modal>
  );
}
