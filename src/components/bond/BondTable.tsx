'use client';
/**
 * BondTable — ตารางรายการตราสารหนี้ (ใช้ทุกหน้า)
 *  - มีช่องค้นหา รหัส / Symbol / ผู้ออก ของตัวเอง
 *  - หัวตาราง 2 ชั้น จัดกลุ่มข้อมูลตราสาร
 *  - ส่งคอลัมน์เพิ่มได้ผ่าน prop `extra`
 */
import { useState } from 'react';
import type { Bond, ExtraColumn } from '@/types';
import { FIELD_DESC, FIELD_GROUPS } from '@/constants';
import { bondView, filesCount, need, type BondView } from '@/store/selectors';
import { StatusBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { SymbolLink } from './SymbolLink';

const BASE_HEADERS = ['รหัส', 'Symbol', 'ชื่อรายการ', 'ผู้ออก', 'สถานะ', 'เอกสาร', 'Version', 'วันที่เผยแพร่'];

// คอลัมน์ข้อมูลที่แสดง (ตัด Symbol ออก เพราะแสดงในคอลัมน์ฐานแล้ว)
const GROUPS = FIELD_GROUPS.map(([title, fields]) => [title, fields.filter((f) => f[1] !== 'sym')] as const);
const FIELDS = GROUPS.flatMap(([, f]) => f);

export function BondTable({ list, extra = [] }: { list: Bond[]; extra?: ExtraColumn[] }) {
  const [q, setQ] = useState('');
  const kw = q.trim().toLowerCase();
  const rows = list.filter((d) => !kw || (d.id + ' ' + (d.symbol || '') + ' ' + (d.co || '')).toLowerCase().includes(kw));

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-center gap-3">
        <Input
          type="search"
          className="min-w-[220px] max-w-[380px] flex-1"
          placeholder="ค้นหา รหัส / Symbol / ผู้ออก"
          aria-label="ค้นหา รหัส Symbol ผู้ออก"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <small className="text-muted">{kw ? `พบ ${rows.length} / ${list.length} รายการ` : ''}</small>
      </div>

      <div className="mb-5 overflow-x-auto rounded-[14px] border border-line bg-card">
        <table>
          <thead>
            <tr>
              {BASE_HEADERS.map((h) => (
                <th key={h} rowSpan={2}>
                  {h}
                </th>
              ))}
              {GROUPS.map(([title, fields]) => (
                <th key={title} colSpan={fields.length} className="!text-center !text-accent">
                  {title}
                </th>
              ))}
              {extra.map((x, i) => (
                <th key={i} rowSpan={2}>
                  {x.header}
                </th>
              ))}
            </tr>
            <tr>
              {FIELDS.map(([label, key]) => (
                <th key={key} title={FIELD_DESC[key]}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={30} className="text-muted">
                  ไม่มีรายการ
                </td>
              </tr>
            )}
            {list.length > 0 && rows.length === 0 && (
              <tr>
                <td colSpan={30} className="text-muted">
                  ไม่พบรายการที่ค้นหา
                </td>
              </tr>
            )}
            {rows.map((d) => {
              const b = bondView(d);
              return (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>
                    <SymbolLink bond={d} />
                  </td>
                  <td>{d.n}</td>
                  <td>{d.co}</td>
                  <td>
                    <StatusBadge status={d.s} />
                  </td>
                  <td>
                    {filesCount(d)}/{need(d)}
                  </td>
                  <td>v{d.v}</td>
                  <td>{d.date || '-'}</td>
                  {FIELDS.map(([, key]) => (
                    <td key={key}>{b[key as keyof BondView]}</td>
                  ))}
                  {extra.map((x, i) => (
                    <td key={i}>{x.render(d)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
