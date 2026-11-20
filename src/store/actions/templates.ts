/**
 * ACTIONS / TEMPLATES — จัดการ Template เอกสาร, Version และ Archive (Reviewer)
 */
import type { TreeNode } from '@/types';
import { cloneTree, addNode, findNode, makeNode, moveNode, removeNode, renameNode } from '@/lib/tree';
import { today } from '@/lib/format';
import { emit, nextNodeId, store } from '../store';
import { getTpl } from '../selectors';
import { ask, logActivity, toast } from './ui';

/** สร้างหัวข้อใหม่ (ใช้ร่วมกับฟอร์มสร้าง Template ที่ยังไม่บันทึก) */
export const newNode = (title: string): TreeNode => makeNode(nextNodeId(), title);

/** สร้าง Template ใหม่ — คืน id */
export function createTemplate(name: string, items: TreeNode[]): string | null {
  if (!items.length) return toast('กรุณาเพิ่มอย่างน้อย 1 หัวข้อ'), null;
  const n = Math.max(0, ...store.data.T.map((x) => +x.id.slice(4))) + 1;
  const id = 'TPL-' + String(n).padStart(2, '0');
  store.data.T.push({ id, n: name, items, on: true, v: 1, arch: 0, upd: false, hist: [], verDate: today() });
  logActivity('สร้าง ' + id, 'tpl');
  toast('สร้างแล้ว — เพิ่ม/แก้ไขรายการต่อได้');
  emit();
  return id;
}

export function renameTemplate(id: string): void {
  ask('ชื่อ Template', getTpl(id).n, (v) => {
    const t = getTpl(id);
    t.n = v || t.n;
    logActivity('แก้ไขชื่อ ' + id, 'tpl');
  });
}

export function toggleTemplate(id: string): void {
  const t = getTpl(id);
  t.on = !t.on;
  logActivity(`${t.on ? 'เปิด' : 'ปิด'} ${id}`, 'tpl');
  emit();
}

/** สลับสถานะ "ต้องปรับปรุง" (ต้องกดก่อนจึงจะออก Version ใหม่ได้) */
export function toggleNeedsUpdate(id: string): void {
  const t = getTpl(id);
  t.upd = !t.upd;
  emit();
}

/* ---------- แก้ไขหัวข้อใน Template ที่มีอยู่ (หน้าจัดการรูปแบบเอกสาร) ---------- */
export function addTemplateItem(tplId: string, parentId: string): void {
  ask(parentId ? 'ชื่อรายการย่อย' : 'ชื่อรายการหลัก', '', (v) => {
    v = v.trim();
    if (!v) return;
    const x = getTpl(tplId);
    addNode(x.items, parentId, newNode(v));
    logActivity(`เพิ่มรายการ "${v}" ใน ${x.id}`, 'tpl');
  });
}

export function renameTemplateItem(tplId: string, nodeId: string): void {
  const r = findNode(getTpl(tplId).items, nodeId);
  if (!r) return;
  ask('แก้ไขชื่อรายการ', r.n.t, (v) => {
    renameNode(getTpl(tplId).items, nodeId, v);
    logActivity('แก้ไขรายการใน ' + tplId, 'tpl');
  });
}

export function deleteTemplateItem(tplId: string, nodeId: string): void {
  const x = getTpl(tplId);
  const removed = removeNode(x.items, nodeId);
  if (!removed) return;
  logActivity(`ลบรายการ "${removed.t}" ออกจาก ${x.id}`, 'tpl');
  toast('ลบแล้ว');
  emit();
}

export function moveTemplateItem(tplId: string, nodeId: string, dir: -1 | 1): void {
  if (!moveNode(getTpl(tplId).items, nodeId, dir)) return;
  logActivity('จัดลำดับรายการ ' + tplId, 'tpl');
  emit();
}

/* ---------- ออก Version ใหม่ (modal) ---------- */
export function openVersionModal(id: string): void {
  const t = getTpl(id);
  if (!t.upd) return toast('ต้องกด "ต้องปรับปรุง" ที่หน้าแก้ไข Template ก่อน จึงจะออก Version ใหม่ได้');
  store.ui.vm = { id, cur: t.v, n: t.n, note: '', items: cloneTree(t.items) };
  emit(false);
}
export function closeVersionModal(): void {
  store.ui.vm = null;
  emit(false);
}

export function addVersionItem(parentId: string): void {
  ask(parentId ? 'ชื่อหัวข้อย่อย' : 'ชื่อหัวข้อ', '', (v) => {
    v = v.trim();
    if (v && store.ui.vm) addNode(store.ui.vm.items, parentId, newNode(v));
  });
}
export function renameVersionItem(nodeId: string): void {
  const vm = store.ui.vm;
  const r = vm && findNode(vm.items, nodeId);
  if (!r) return;
  ask('แก้ไขชื่อ', r.n.t, (v) => {
    if (store.ui.vm) renameNode(store.ui.vm.items, nodeId, v);
  });
}
export function deleteVersionItem(nodeId: string): void {
  if (store.ui.vm) removeNode(store.ui.vm.items, nodeId);
  emit(false);
}
export function moveVersionItem(nodeId: string, dir: -1 | 1): void {
  if (store.ui.vm) moveNode(store.ui.vm.items, nodeId, dir);
  emit(false);
}
export function setVersionField(field: 'n' | 'note', value: string): void {
  if (store.ui.vm) store.ui.vm[field] = value;
  emit(false);
}

/** บันทึกเป็น Version ใหม่ — Version เดิมถูกเก็บเป็น Archive */
export function saveVersion(): void {
  const m = store.ui.vm;
  if (!m) return;
  const t = getTpl(m.id);
  const name = m.n.trim() || t.n;
  if (!t.upd) return toast('ต้องกด "ต้องปรับปรุง" ที่หน้าแก้ไข Template ก่อน จึงจะออก Version ใหม่ได้');
  if (!m.items.length) return toast('ต้องมีอย่างน้อย 1 หัวข้อ');
  if (name === t.n && JSON.stringify(cloneTree(m.items)) === JSON.stringify(cloneTree(t.items))) {
    return toast('ยังไม่มีการเปลี่ยนแปลง');
  }
  t.hist.push({ v: t.v, n: t.n, items: cloneTree(t.items), date: today(), note: t.note || '' });
  t.v++;
  t.n = name;
  t.items = m.items;
  t.note = m.note.trim();
  t.verDate = today();
  t.arch = t.hist.length;
  t.upd = false;
  logActivity(`ออก Version ใหม่ ${t.id} v${t.v}${t.note ? ': ' + t.note : ''}`, 'tpl');
  toast('ออก Version ใหม่ v' + t.v + ' แล้ว');
  store.ui.vm = null;
  emit();
}

/* ---------- Archive ---------- */
export function openArchive(id: string): void {
  const t = getTpl(id);
  if (!t.hist.length) return;
  store.ui.av = { id, v: t.hist[t.hist.length - 1].v };
  emit(false);
}
export function selectArchiveVersion(v: number): void {
  if (store.ui.av) store.ui.av.v = v;
  emit(false);
}
export function closeArchive(): void {
  store.ui.av = null;
  emit(false);
}
