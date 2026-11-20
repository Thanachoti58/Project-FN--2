'use client';
/** TFMT (reviewer) — จัดการรูปแบบเอกสาร: เพิ่ม ลบ แก้ชื่อ จัดลำดับหัวข้อของ Template */
import { useState } from 'react';
import { useQueryParam } from '@/hooks/useViewParams';
import { useStore } from '@/hooks/useStore';
import { getTpl } from '@/store/selectors';
import { addTemplateItem, deleteTemplateItem, moveTemplateItem, renameTemplateItem } from '@/store';
import { walkTree } from '@/lib/tree';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Misc';
import { RowActions, TreeRow } from '@/components/template/TreeRow';

export function TemplateFormatView() {
  const { data } = useStore();
  const fromUrl = useQueryParam('tpl');
  const [picked, setPicked] = useState('');
  const id = picked || fromUrl || 'TPL-01';
  const x = getTpl(id);

  return (
    <PageShell view="tfmt" title="จัดการรูปแบบเอกสาร" subtitle="เพิ่ม ลบ แก้ชื่อ และจัดลำดับรายการหลัก / รายการย่อยของ Template">
      <Card>
        <Select value={id} onChange={(e) => setPicked(e.target.value)}>
          {data.T.map((y) => (
            <option key={y.id} value={y.id}>{y.n}</option>
          ))}
        </Select>
      </Card>
      <Notice title="หมายเหตุ">รายการที่เพิ่มใหม่จะถูกนับเป็นเอกสารที่ยังไม่แนบ ในรายการที่ยังไม่เผยแพร่ซึ่งใช้ Template นี้</Notice>
      <div className="grid max-w-[900px] gap-1.5">
        {x.items.length ? (
          walkTree(x.items, (n, no, dep, i, arr) => (
            <TreeRow key={n.id} no={no} depth={dep} title={n.t} hint="แนบ zip / pdf">
              <RowActions>
                <Button variant="outline" disabled={i === 0} onClick={() => moveTemplateItem(id, n.id, -1)}>↑</Button>
                <Button variant="outline" disabled={i === arr.length - 1} onClick={() => moveTemplateItem(id, n.id, 1)}>↓</Button>
                <Button variant="outline" onClick={() => addTemplateItem(id, n.id)}>+ ย่อย</Button>
                <Button variant="outline" onClick={() => renameTemplateItem(id, n.id)}>แก้ชื่อ</Button>
                <Button variant="danger" onClick={() => deleteTemplateItem(id, n.id)}>ลบ</Button>
              </RowActions>
            </TreeRow>
          ))
        ) : (
          <p className="m-0 text-muted">ยังไม่มีรายการ</p>
        )}
      </div>
      <div className="mt-3.5">
        <Button onClick={() => addTemplateItem(id, '')}>+ เพิ่มรายการหลัก</Button>
      </div>
    </PageShell>
  );
}
