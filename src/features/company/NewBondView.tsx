'use client';
/**
 * ONEW (company / ใช้ได้ทุกบทบาทที่เข้าถึง) — สร้างรายการตราสารหนี้ 2 ขั้นตอน
 *   1 · ข้อมูลทั่วไป   2 · ข้อมูลเทมเพลต (แนบเอกสาร) → บันทึกร่าง / ส่งให้ Document
 */
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_ISSUER, DEFAULT_TENOR_SPEC, TENOR_SETS, kindsOf } from '@/constants';
import { useStore } from '@/hooks/useStore';
import { useQueryParam } from '@/hooks/useViewParams';
import { createBond, toast, validateBondForm, type BondFormValues } from '@/store';
import { getTpl, usableTemplates } from '@/store/selectors';
import { addTenor } from '@/lib/format';
import { flatten } from '@/lib/tree';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Select } from '@/components/ui/Field';
import { AttachTree } from './AttachTree';
import { NewBondFields } from './NewBondFields';

const emptyForm = (tp: string, co: string): BondFormValues => ({
  sector: 'private',
  kind: 'หุ้นกู้',
  tenorSpec: DEFAULT_TENOR_SPEC,
  n: '',
  symbol: '',
  co,
  tp,
  iss: '',
  mat: '',
  reg: '',
  size: '',
  out: '',
  opt: '',
  sec: 'UNSECURE',
  rep: '',
  regs: '',
  cd: '',
  ri: '',
  ria: 'TRIS',
  rc: '',
  rca: 'TRIS',
});

export function NewBondView() {
  const { session } = useStore();
  const router = useRouter();
  const tplParam = useQueryParam('tpl');
  const templates = usableTemplates();
  const isCompany = session.role === 'company';

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<BondFormValues>(() =>
    emptyForm(templates.find((t) => t.id === tplParam)?.id ?? templates[0]?.id ?? '', isCompany ? session.co : 'บริษัท xxx จำกัด'),
  );
  const [files, setFiles] = useState<Record<string, string>>({});
  const [blobs, setBlobs] = useState<Record<string, string>>({});
  const step1Ref = useRef<HTMLDivElement>(null);
  const submitNow = useRef(false);

  const set = (name: keyof BondFormValues, value: string) => setForm((f) => ({ ...f, [name]: value }));
  const clearFiles = () => {
    Object.values(blobs).forEach((u) => URL.revokeObjectURL(u));
    setFiles({});
    setBlobs({});
  };

  /* ---------- ปฏิกิริยาของฟิลด์ที่เกี่ยวเนื่องกัน ---------- */
  /** คำนวณ Maturity Date จาก Issue Date + อายุตราสาร */
  const withMaturity = (f: BondFormValues): BondFormValues =>
    f.iss ? { ...f, mat: addTenor(f.iss, f.tenorSpec.split('|')[1]) } : f;

  const onKind = (kind: string) =>
    setForm((f) =>
      withMaturity({
        ...f,
        kind,
        tenorSpec: TENOR_SETS[kind][0][0],
        co: isCompany ? f.co : kind in DEFAULT_ISSUER ? DEFAULT_ISSUER[kind] : f.co,
      }),
    );
  const onSector = (sector: BondFormValues['sector']) => {
    clearFiles();
    const kind = kindsOf(sector)[0];
    setForm((f) =>
      withMaturity({
        ...f,
        sector,
        kind,
        tp: sector === 'government' ? 'TPL-04' : 'TPL-01',
        tenorSpec: TENOR_SETS[kind][0][0],
        co: isCompany ? f.co : DEFAULT_ISSUER[kind],
      }),
    );
  };
  const onTenor = (tenorSpec: string) => setForm((f) => withMaturity({ ...f, tenorSpec }));
  const onIssue = (iss: string) => setForm((f) => withMaturity({ ...f, iss }));

  /* ---------- แนบไฟล์ ---------- */
  const pick = (id: string, file: File) => {
    if (!/\.(zip|pdf)$/i.test(file.name)) return toast('แนบได้เฉพาะไฟล์ .zip หรือ .pdf');
    if (blobs[id]) URL.revokeObjectURL(blobs[id]);
    setFiles((p) => ({ ...p, [id]: file.name }));
    setBlobs((p) => ({ ...p, [id]: URL.createObjectURL(file) }));
  };
  const remove = (id: string) => {
    if (blobs[id]) URL.revokeObjectURL(blobs[id]);
    setFiles(({ [id]: _drop, ...rest }) => rest);
    setBlobs(({ [id]: _drop, ...rest }) => rest);
  };

  /* ---------- ขั้นตอน ---------- */
  const next = () => {
    const els = step1Ref.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select') ?? [];
    for (const el of Array.from(els)) if (!el.reportValidity()) return;
    const err = validateBondForm(form);
    if (err) return toast(err);
    setStep(2);
    document.querySelector('main')?.scrollTo({ top: 0 });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2) return next();
    const res = await createBond(form, files, blobs, submitNow.current);
    if ('error' in res) {
      setStep(1);
      return toast(res.error);
    }
    clearFiles();
    router.push(submitNow.current ? '/otrk' : '/oedit');
  };

  const tpl = getTpl(form.tp);
  const got = flatten(tpl.items).filter((n) => files[n.id]).length;

  const stepPill = (n: 1 | 2, label: string) => (
    <span
      className={`flex-1 rounded-[10px] border px-3.5 py-2.5 font-semibold ${
        step === n ? 'border-accent bg-deep text-ink' : n < step ? 'border-line text-accent' : 'border-line text-muted'
      }`}
    >
      {label}
    </span>
  );

  return (
    <PageShell
      view="onew"
      title="สร้างรายการตราสารหนี้"
      subtitle="กรอก 1 · ข้อมูลทั่วไปให้ครบ แล้วระบบจะพาไป 2 · ข้อมูลเทมเพลตเพื่อแนบเอกสารต่อทันที ระบบตรวจคำเรียก รหัส และอายุตราสารให้สอดคล้องกับประเภทผู้ออก"
    >
      <Card>
        <form onSubmit={submit}>
          <div className="mb-[18px] flex gap-2.5">
            {stepPill(1, '1 · ข้อมูลทั่วไป')}
            {stepPill(2, '2 · ข้อมูลเทมเพลต')}
          </div>

          {/* ---------- ขั้นที่ 1 ---------- */}
          <div ref={step1Ref} hidden={step === 2}>
            <NewBondFields v={form} readOnlyIssuer={isCompany} set={set} onSector={onSector} onKind={onKind} onTenor={onTenor} onIssue={onIssue} />
            <div className="mt-[18px] text-right">
              <Button onClick={next}>ถัดไป: ข้อมูลเทมเพลต →</Button>
            </div>
          </div>

          {/* ---------- ขั้นที่ 2 ---------- */}
          <div hidden={step === 1}>
            <Field label="Template">
              <Select
                value={form.tp}
                onChange={(e) => {
                  clearFiles();
                  set('tp', e.target.value);
                }}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.n}</option>
                ))}
              </Select>
            </Field>
            <p className="mb-2 mt-3 text-muted">
              แนบแล้ว {got}/{flatten(tpl.items).length}
            </p>
            <div className="mb-[18px]">
              <AttachTree
                items={tpl.items}
                files={files}
                hrefOf={(id) => blobs[id]}
                onPick={pick}
                onRemove={remove}
              />
            </div>
            <div className="mt-1.5">
              <Button variant="outline" onClick={() => setStep(1)}>← ย้อนกลับ</Button>
              <Button type="submit" variant="outline" onClick={() => (submitNow.current = false)}>บันทึกร่าง</Button>
              <Button type="submit" onClick={() => (submitNow.current = true)}>บันทึกและส่งให้ Document</Button>
            </div>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
