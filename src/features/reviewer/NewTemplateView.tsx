'use client';
/** TNEW (reviewer) — สร้าง Template ใหม่ (ตั้งชื่อ + เพิ่มหัวข้อ/หัวข้อย่อย จัดลำดับ ก่อนกดสร้าง) */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TreeNode } from '@/types';
import { ask, createTemplate, newNode } from '@/store';
import { addNode, cloneTree, findNode, moveNode, removeNode, renameNode, walkTree } from '@/lib/tree';
import { useStore } from '@/hooks/useStore';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { RowActions, TreeRow } from '@/components/template/TreeRow';

export function NewTemplateView() {
  useStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [items, setItems] = useState<TreeNode[]>([]);

  /** แก้ไขสำเนาของต้นไม้แล้วตั้งค่าใหม่ (ไม่แก้ state เดิมตรง ๆ) */
  const edit = (fn: (root: TreeNode[]) => void) =>
    setItems((prev) => {
      const next = cloneTree(prev);
      fn(next);
      return next;
    });

  const add = (parentId: string) =>
    ask(parentId ? 'ชื่อหัวข้อย่อย' : 'ชื่อหัวข้อ', '', (v) => {
      v = v.trim();
      if (v) edit((root) => addNode(root, parentId, newNode(v)));
    });

  const rename = (id: string) => {
    const r = findNode(items, id);
    if (r) ask('แก้ไขชื่อ', r.n.t, (v) => edit((root) => renameNode(root, id, v)));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = createTemplate(name, items);
    if (id) router.push('/tfmt?tpl=' + id);
  };

  return (
    <PageShell view="tnew" title="สร้าง Template" subtitle="ตั้งชื่อ Template แล้วเพิ่มหัวข้อและหัวข้อย่อย — แก้ชื่อ จัดลำดับ หรือลบได้ก่อนกดสร้าง">
      <Card $wide>
        <form onSubmit={submit}>
          <Field label="ชื่อ Template">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid max-w-[900px] gap-1.5">
            {items.length ? (
              walkTree(items, (n, no, dep, i, arr) => (
                <TreeRow key={n.id} no={no} depth={dep} title={n.t} hint={dep ? 'หัวข้อย่อย' : 'หัวข้อ'}>
                  <RowActions>
                    <Button variant="outline" disabled={i === 0} onClick={() => edit((r) => moveNode(r, n.id, -1))}>↑</Button>
                    <Button variant="outline" disabled={i === arr.length - 1} onClick={() => edit((r) => moveNode(r, n.id, 1))}>↓</Button>
                    <Button variant="outline" onClick={() => add(n.id)}>+ หัวข้อย่อย</Button>
                    <Button variant="outline" onClick={() => rename(n.id)}>แก้ชื่อ</Button>
                    <Button variant="danger" onClick={() => edit((r) => removeNode(r, n.id))}>ลบ</Button>
                  </RowActions>
                </TreeRow>
              ))
            ) : (
              <p className="m-0 text-muted">ยังไม่มีหัวข้อ — กด &quot;+ เพิ่มหัวข้อ&quot; เพื่อเริ่ม</p>
            )}
          </div>
          <div>
            <Button onClick={() => add('')}>+ เพิ่มหัวข้อ</Button>
          </div>
          <div className="text-right">
            <Button type="submit">สร้าง Template</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
