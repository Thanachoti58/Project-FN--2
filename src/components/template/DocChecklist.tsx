'use client';
/** DocChecklist — รายการเอกสารตาม Template พร้อมสถานะแนบ/ยังไม่แนบ (ใช้ตอน Manager ตรวจ) */
import type { Bond } from '@/types';
import { walkTree } from '@/lib/tree';
import { getTpl } from '@/store/selectors';
import { openPreview } from '@/store';
import { TreeRow } from './TreeRow';

export function DocChecklist({ bond, className = '' }: { bond: Bond; className?: string }) {
  const up = bond.up || {};
  return (
    <div className={`grid max-w-[900px] gap-1.5 ${className}`}>
      {walkTree(getTpl(bond.tp).items, (n, no, dep) => (
        <TreeRow key={n.id} no={no} depth={dep} title={n.t}>
          {up[n.id] ? (
            <FileLink name={up[n.id]} blobKey={`${bond.id}|${n.id}`} />
          ) : (
            <em className="text-xs not-italic text-danger">✗ ยังไม่แนบ</em>
          )}
        </TreeRow>
      ))}
    </div>
  );
}

/** ลิงก์ชื่อไฟล์ที่แนบแล้ว — คลิกเพื่อดูตัวอย่าง */
export function FileLink({ name, href, blobKey }: { name: string; href?: string; blobKey?: string }) {
  return (
    <em
      className="cursor-pointer text-xs not-italic text-accent underline underline-offset-[3px] hover:text-white"
      title="คลิกเพื่อดูไฟล์"
      onClick={() => openPreview(name, href, blobKey)}
    >
      ✓ {name}
    </em>
  );
}
