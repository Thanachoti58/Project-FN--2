'use client';
/** AttachTree — รายการหัวข้อของ Template พร้อมปุ่มแนบ / เปลี่ยน / ลบไฟล์ (.zip .pdf) */
import type { TreeNode } from '@/types';
import { walkTree } from '@/lib/tree';
import { Button } from '@/components/ui/Button';
import { FileLink } from '@/components/template/DocChecklist';
import { RowActions, TreeRow } from '@/components/template/TreeRow';

export interface AttachTreeProps {
  items: TreeNode[];
  /** ชื่อไฟล์ที่แนบแล้ว (key = id หัวข้อ) */
  files: Record<string, string>;
  /** ลิงก์ชั่วคราวสำหรับไฟล์ที่ยังไม่บันทึกรายการ */
  hrefOf?: (nodeId: string) => string | undefined;
  /** key ของไฟล์จริงที่บันทึกถาวร */
  blobKeyOf?: (nodeId: string) => string;
  onPick: (nodeId: string, file: File) => void;
  onRemove: (nodeId: string) => void;
  /** ข้อความ "ยังไม่แนบ" */
  emptyLabel?: React.ReactNode;
}

const ACCEPT = '.zip,.pdf,application/pdf,application/zip';

function FilePicker({ label, outline, onFile }: { label: string; outline?: boolean; onFile: (f: File) => void }) {
  return (
    <label
      className={`inline-block min-h-[36px] cursor-pointer rounded-lg px-3.5 py-2 text-white ${
        outline ? 'border border-line bg-transparent text-ink' : 'bg-brand'
      }`}
    >
      {label}
      <input
        type="file"
        hidden
        accept={ACCEPT}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = ''; // เลือกไฟล์เดิมซ้ำได้
        }}
      />
    </label>
  );
}

export function AttachTree({ items, files, hrefOf, blobKeyOf, onPick, onRemove, emptyLabel }: AttachTreeProps) {
  if (!items.length) return <p className="m-0 text-muted">เทมเพลตนี้ยังไม่มีรายการ</p>;
  return (
    <div className="grid max-w-[900px] gap-1.5">
      {walkTree(items, (n, no, dep) => (
        <TreeRow key={n.id} no={no} depth={dep} title={n.t}>
          {files[n.id] ? (
            <>
              <FileLink name={files[n.id]} href={hrefOf?.(n.id)} blobKey={blobKeyOf?.(n.id)} />
              <RowActions>
                <FilePicker outline label="เปลี่ยนไฟล์" onFile={(f) => onPick(n.id, f)} />
                <Button variant="outline" onClick={() => onRemove(n.id)}>ลบไฟล์</Button>
              </RowActions>
            </>
          ) : (
            <>
              {emptyLabel}
              <RowActions>
                <FilePicker label="แนบไฟล์" onFile={(f) => onPick(n.id, f)} />
              </RowActions>
            </>
          )}
        </TreeRow>
      ))}
    </div>
  );
}
