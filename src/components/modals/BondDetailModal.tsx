'use client';
/** BondDetailModal — รายละเอียดตราสารหนี้ (กดที่ Symbol) */
import { FIELD_DESC, FIELD_GROUPS } from '@/constants';
import { closeDetail, store } from '@/store';
import { bondView, filesCount, getTpl, need, type BondView } from '@/store/selectors';
import { issuerLabel } from '@/lib/format';
import { walkTree } from '@/lib/tree';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { KeyValue } from '@/components/ui/Misc';
import { FileLink } from '@/components/template/DocChecklist';
import { TreeRow } from '@/components/template/TreeRow';

export function BondDetailModal({ id }: { id: string }) {
  const d = store.data.D.find((x) => x.id === id);
  if (!d) return null;
  const t = getTpl(d.tp);
  const up = d.up || {};
  const b = bondView(d);
  const logs = store.data.L.filter((l) => l.a.includes(d.id));

  return (
    <Modal maxWidth={640}>
      {/* ส่วนหัว (ติดบนสุดเมื่อเลื่อน) */}
      <div className="sticky -top-5 z-[1] -mx-5 -mt-5 mb-3 flex items-center justify-between gap-3 border-b border-line bg-card px-5 py-3.5">
        <h3 className="!m-0">รายละเอียดตราสารหนี้ · {d.symbol || '-'}</h3>
        <Button variant="outline" aria-label="ปิด" title="ปิด" onClick={closeDetail} className="!min-w-[36px] !px-2.5 !py-1.5 !text-base !leading-none">
          ✕
        </Button>
      </div>

      {/* ข้อมูลทั่วไป */}
      <KeyValue k="รหัสเอกสาร" v={d.id} />
      <KeyValue k="Symbol" v={d.symbol || '-'} />
      <KeyValue k="ชื่อรายการ" v={d.n} />
      <KeyValue k="ผู้ออก" v={d.co} />
      <KeyValue k="ประเภทผู้ออก" v={issuerLabel(d)} />
      <KeyValue k="คำเรียกตราสาร" v={d.kind} />
      <KeyValue k="อายุตราสาร" v={`${d.tenor} (${d.termGroup === 'short' ? 'ระยะสั้น' : 'ระยะยาว'})`} />
      <KeyValue k="สถานะ" v={<StatusBadge status={d.s} />} />
      <KeyValue k="Version เอกสาร" v={'v' + d.v + (d.a ? ' · Archive ' + d.a : '')} />
      <KeyValue k="วันที่เผยแพร่" v={d.date || '-'} />

      {/* ข้อมูลตราสารแบ่งเป็นกลุ่ม */}
      {FIELD_GROUPS.map(([title, fields]) => (
        <div key={title}>
          <h3 className="!mb-2 !mt-4">{title}</h3>
          {fields.map(([label, key]) => (
            <KeyValue key={key} k={<span title={FIELD_DESC[key]}>{label}</span>} v={b[key as keyof BondView]} />
          ))}
        </div>
      ))}

      <KeyValue k="Template" v={`${t.n} v${t.v}`} />
      {d.note ? <KeyValue k="หมายเหตุ" v={d.note} /> : null}

      {/* เอกสารที่แนบ */}
      <h3 className="!mb-2 !mt-4">
        เอกสารที่แนบ ({filesCount(d)}/{need(d)})
      </h3>
      <div className="grid gap-1.5">
        {walkTree(t.items, (n, no, dep) => (
          <TreeRow key={n.id} no={no} depth={dep} title={n.t}>
            {up[n.id] ? (
              <FileLink name={up[n.id]} blobKey={`${d.id}|${n.id}`} />
            ) : (
              <em className="text-xs not-italic text-danger">ยังไม่แนบ</em>
            )}
          </TreeRow>
        ))}
      </div>

      {/* ประวัติ */}
      <h3 className="!mb-2 !mt-4">ประวัติของรายการนี้</h3>
      {logs.length ? (
        <DataTable headers={['วันที่และเวลา', 'ผู้ใช้', 'รายการ']} rows={logs.map((l) => [l.t, l.u, l.a])} />
      ) : (
        <p className="m-0 text-muted">ยังไม่มีประวัติ</p>
      )}
      <div className="mt-3.5 text-right">
        <Button variant="outline" onClick={closeDetail}>ปิด</Button>
      </div>
    </Modal>
  );
}
