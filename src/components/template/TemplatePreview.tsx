import type { TreeNode } from '@/types';
import { walkTree } from '@/lib/tree';
import { TreeRow } from './TreeRow';

/** TemplatePreview — แสดงโครงสร้างหัวข้อของ Template (อ่านอย่างเดียว) */
export function TemplatePreview({ items }: { items: TreeNode[] }) {
  if (!items.length) return <p className="m-0 text-muted">เทมเพลตนี้ยังไม่มีรายการ</p>;
  return (
    <div className="grid max-w-[900px] gap-1.5">
      {walkTree(items, (n, no, dep) => (
        <TreeRow key={n.id} no={no} depth={dep} title={n.t} />
      ))}
    </div>
  );
}
