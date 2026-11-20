/**
 * ฟังก์ชันจัดการโครงสร้างต้นไม้ของ Template (หัวข้อ / หัวข้อย่อย)
 * ทุกฟังก์ชันเป็น pure function ยกเว้นกลุ่ม "แก้ไขแบบ in-place" ที่ระบุไว้
 */
import type { TreeNode } from '@/types';

/** สร้างโหนดใหม่ (ต้องส่ง id มาจาก nextNodeId ใน store) */
export const makeNode = (id: string, t: string, c: TreeNode[] = []): TreeNode => ({ id, t, c });

/** แตกต้นไม้เป็นลิสต์แบบแบน (รวมหัวข้อย่อยทุกชั้น) */
export const flatten = (nodes: TreeNode[]): TreeNode[] => nodes.flatMap((n) => [n, ...flatten(n.c)]);

/** คัดลอกต้นไม้แบบ deep */
export const cloneTree = (nodes: TreeNode[]): TreeNode[] =>
  nodes.map((n) => ({ id: n.id, t: n.t, c: cloneTree(n.c) }));

export interface FoundNode {
  arr: TreeNode[];
  i: number;
  n: TreeNode;
}

/** ค้นหาโหนดจาก id พร้อมตำแหน่งในอาร์เรย์แม่ */
export function findNode(nodes: TreeNode[], id: string): FoundNode | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { arr: nodes, i, n: nodes[i] };
    const r = findNode(nodes[i].c, id);
    if (r) return r;
  }
  return null;
}

/**
 * เดินต้นไม้แล้วแปลงแต่ละโหนดเป็นค่า (เช่น React element)
 * @param fn (โหนด, เลขหัวข้อ เช่น "1.2", ความลึก, ลำดับในชั้น, อาร์เรย์ชั้นนั้น)
 */
export function walkTree<T>(
  nodes: TreeNode[],
  fn: (n: TreeNode, no: string, depth: number, index: number, siblings: TreeNode[]) => T,
  prefix = '',
  depth = 0,
): T[] {
  return nodes.flatMap((n, i) => {
    const no = prefix + (i + 1);
    return [fn(n, no, depth, i, nodes), ...walkTree(n.c, fn, no + '.', depth + 1)];
  });
}

/* ---------- แก้ไขแบบ in-place (ใช้กับ state ที่ clone มาแล้ว) ---------- */

/** เพิ่มหัวข้อ (parentId ว่าง = ระดับบนสุด) */
export function addNode(root: TreeNode[], parentId: string, node: TreeNode): void {
  if (parentId) findNode(root, parentId)?.n.c.push(node);
  else root.push(node);
}

/** เปลี่ยนชื่อหัวข้อ */
export function renameNode(root: TreeNode[], id: string, title: string): void {
  const r = findNode(root, id);
  if (r) r.n.t = title.trim() || r.n.t;
}

/** ลบหัวข้อ คืนค่าโหนดที่ถูกลบ */
export function removeNode(root: TreeNode[], id: string): TreeNode | null {
  const r = findNode(root, id);
  if (!r) return null;
  r.arr.splice(r.i, 1);
  return r.n;
}

/** ย้ายหัวข้อขึ้น (-1) / ลง (+1) ภายในชั้นเดียวกัน */
export function moveNode(root: TreeNode[], id: string, dir: -1 | 1): boolean {
  const r = findNode(root, id);
  if (!r) return false;
  const j = r.i + dir;
  if (j < 0 || j >= r.arr.length) return false;
  [r.arr[r.i], r.arr[j]] = [r.arr[j], r.arr[r.i]];
  return true;
}
