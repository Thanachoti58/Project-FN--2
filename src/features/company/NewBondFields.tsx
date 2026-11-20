'use client';
/** NewBondFields — ขั้นที่ 1: ข้อมูลทั่วไป + วันที่/มูลค่า/หลักประกัน/เรตติ้ง (ฟอร์มควบคุมโดย NewBondView) */
import type { BondFormValues } from '@/store';
import { TENOR_SETS, kindsOf } from '@/constants';
import { yrs } from '@/lib/format';
import { Field, Input, Select } from '@/components/ui/Field';

export interface BondFieldsProps {
  v: BondFormValues;
  readOnlyIssuer: boolean;
  set: (name: keyof BondFormValues, value: string) => void;
  onSector: (s: BondFormValues['sector']) => void;
  onKind: (k: string) => void;
  onTenor: (spec: string) => void;
  onIssue: (date: string) => void;
}

/** กลุ่มฟิลด์ที่มีหัวข้อ */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h3 className="!mb-2.5 !mt-5">{title}</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">{children}</div>
    </>
  );
}

const AGENCIES = ['TRIS', 'Fitch', 'S&P'];

export function NewBondFields({ v, readOnlyIssuer, set, onSector, onKind, onTenor, onIssue }: BondFieldsProps) {
  // Term / TTM คำนวณอัตโนมัติจากวันที่
  const term = v.iss && v.mat ? yrs(v.iss, v.mat).toFixed(2) : '';
  const ttm = v.mat ? Math.max(0, yrs(new Date(), v.mat)).toFixed(2) : '';
  const tenors = TENOR_SETS[v.kind] ?? [];

  const text = (label: string, name: keyof BondFormValues, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label}>
      <Input name={name} value={v[name]} onChange={(e) => set(name, e.target.value)} {...extra} />
    </Field>
  );
  const rating = (label: string, name: 'ri' | 'rc', agency: 'ria' | 'rca') => (
    <Field label={label}>
      <div className="flex gap-2">
        <Input name={name} placeholder="เช่น AA-" className="min-w-0 flex-1" value={v[name]} onChange={(e) => set(name, e.target.value)} />
        <Select name={agency} className="w-[110px]" value={v[agency]} onChange={(e) => set(agency, e.target.value)}>
          {AGENCIES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </Select>
      </div>
    </Field>
  );

  return (
    <>
      {/* ---------- ข้อมูลทั่วไป ---------- */}
      <div className="grid gap-3.5">
        <Field label="ประเภทผู้ออก">
          <Select name="sector" value={v.sector} onChange={(e) => onSector(e.target.value as BondFormValues['sector'])}>
            <option value="private">ภาคเอกชน</option>
            <option value="government">ภาครัฐบาล</option>
          </Select>
        </Field>
        <Field label="คำเรียกตราสาร">
          <Select name="kind" value={v.kind} onChange={(e) => onKind(e.target.value)}>
            {kindsOf(v.sector).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
        </Field>
        <Field label="อายุตราสาร">
          <Select name="tenorSpec" required value={v.tenorSpec} onChange={(e) => onTenor(e.target.value)}>
            {tenors.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </Select>
        </Field>
        {text('ชื่อรายการตามมาตรฐาน', 'n', { placeholder: 'เช่น หุ้นกู้บริษัท A ครั้งที่ 1/2569', required: true })}
        {text('Symbol / รหัสตราสาร', 'symbol', { placeholder: 'เช่น PTT29NA หรือ LB346A', required: true })}
        {text('บริษัทหรือหน่วยงานผู้ออก', 'co', { required: true, readOnly: readOnlyIssuer })}
      </div>

      {/* ---------- วันที่และอายุ ---------- */}
      <Group title="วันที่และอายุตราสาร">
        <Field label="Issue Date">
          <Input name="iss" type="date" required value={v.iss} onChange={(e) => onIssue(e.target.value)} />
        </Field>
        <Field label="Maturity Date (คำนวณจากอายุตราสาร แก้ไขได้)">
          <Input name="mat" type="date" required value={v.mat} onChange={(e) => set('mat', e.target.value)} />
        </Field>
        <Field label="Term (Yrs.) · คำนวณอัตโนมัติ">
          <Input readOnly placeholder="-" value={term} />
        </Field>
        <Field label="TTM (Yrs.) · คำนวณอัตโนมัติ">
          <Input readOnly placeholder="-" value={ttm} />
        </Field>
        <Field label="Registered Date">
          <Input name="reg" type="date" required value={v.reg} onChange={(e) => set('reg', e.target.value)} />
        </Field>
      </Group>

      {/* ---------- มูลค่า ---------- */}
      <Group title="มูลค่าและเงื่อนไขการเสนอขาย">
        {text('Issue Size (THB Mln.)', 'size', { type: 'number', min: 0, step: 'any', required: true })}
        {text('Outstanding (THB Mln.)', 'out', { type: 'number', min: 0, step: 'any', required: true })}
        <Field label="Option">
          <Select name="opt" value={v.opt} onChange={(e) => set('opt', e.target.value)}>
            <option value="">ไม่มี</option>
            <option>Callable</option>
            <option>Puttable</option>
            <option>Callable / Puttable</option>
          </Select>
        </Field>
      </Group>

      {/* ---------- หลักประกัน ---------- */}
      <Group title="หลักประกันและความปลอดภัย">
        <Field label="Secured Type">
          <Select name="sec" required value={v.sec} onChange={(e) => set('sec', e.target.value)}>
            <option value="UNSECURE">UNSECURE (ไม่มีหลักประกัน)</option>
            <option value="SECURE">SECURE (มีหลักประกัน)</option>
          </Select>
        </Field>
        {text('Bondholder Representative', 'rep', { placeholder: 'เช่น ธนาคารกรุงไทย (KTB)' })}
        {text('Registrar', 'regs', { placeholder: 'เช่น ธนาคารกรุงเทพ (BBL)' })}
        {text('Cross Default Amount (THB Mln.)', 'cd', { type: 'number', min: 0, step: 'any' })}
      </Group>

      {/* ---------- เรตติ้ง ---------- */}
      <Group title="อันดับความน่าเชื่อถือ (Credit Rating)">
        {rating('Issue Rating / Rating Agency', 'ri', 'ria')}
        {rating('Company Rating / Rating Agency', 'rc', 'rca')}
      </Group>
    </>
  );
}
