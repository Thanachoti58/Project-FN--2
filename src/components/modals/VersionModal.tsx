'use client';
/** VersionModal — ออก Template Version ใหม่ (แก้ชื่อ/หัวข้อ แล้วเก็บ Version เดิมเป็น Archive) */
import type { VersionDraft } from '@/types';
import {
  addVersionItem,
  closeVersionModal,
  deleteVersionItem,
  moveVersionItem,
  renameVersionItem,
  saveVersion,
  setVersionField,
} from '@/store';
import { walkTree } from '@/lib/tree';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { RowActions, TreeRow } from '@/components/template/TreeRow';

export function VersionModal({ vm }: { vm: VersionDraft }) {
  return (
    <Modal maxWidth={720}>
      <h3>
        ออก Version ใหม่ · {vm.id} (v{vm.cur} → v{vm.cur + 1})
      </h3>
      <p className="mb-3 text-muted">Version เดิมจะถูกเก็บเป็น Archive — แก้ไข เพิ่ม หรือลดข้อมูล Template ได้ตามต้องการ</p>
      <div className="grid gap-3">
        <Field label="ชื่อ Template">
          <Input value={vm.n} onChange={(e) => setVersionField('n', e.target.value)} />
        </Field>
        <Field label="สรุปการเปลี่ยนแปลง">
          <Input
            value={vm.note}
            placeholder="เช่น เพิ่มหัวข้อหนังสือรับรองผู้สอบบัญชี"
            onChange={(e) => setVersionField('note', e.target.value)}
          />
        </Field>
        <div className="grid gap-1.5">
          {vm.items.length ? (
            walkTree(vm.items, (n, no, dep, i, arr) => (
              <TreeRow key={n.id} no={no} depth={dep} title={n.t}>
                <RowActions>
                  <Button variant="outline" disabled={i === 0} onClick={() => moveVersionItem(n.id, -1)}>↑</Button>
                  <Button variant="outline" disabled={i === arr.length - 1} onClick={() => moveVersionItem(n.id, 1)}>↓</Button>
                  <Button variant="outline" onClick={() => addVersionItem(n.id)}>+ ย่อย</Button>
                  <Button variant="outline" onClick={() => renameVersionItem(n.id)}>แก้ชื่อ</Button>
                  <Button variant="danger" onClick={() => deleteVersionItem(n.id)}>ลบ</Button>
                </RowActions>
              </TreeRow>
            ))
          ) : (
            <p className="m-0 text-muted">ยังไม่มีหัวข้อ</p>
          )}
        </div>
        <div>
          <Button variant="outline" onClick={() => addVersionItem('')}>+ เพิ่มหัวข้อ</Button>
        </div>
      </div>
      <div className="mt-4 text-right">
        <Button variant="outline" onClick={closeVersionModal}>ยกเลิก</Button>
        <Button onClick={saveVersion}>บันทึกเป็น Version ใหม่</Button>
      </div>
    </Modal>
  );
}
