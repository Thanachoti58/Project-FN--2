'use client';
/** CPROG (company) — โครงการ MTN: สร้างโครงการ + ออกรุ่นย่อยโดยผูกกับโครงการ (หน่วย: ล้านบาท) */
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { createProject, createSubIssue } from '@/store';
import { nf, today } from '@/lib/format';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Field, Input, Select } from '@/components/ui/Field';

export function ProjectsView() {
  const { data, session } = useStore();
  const router = useRouter();
  const projects = data.PG.filter((p) => p.co === session.co);
  const alive = (exp: string) => exp >= today();

  const onCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    createProject(String(f.get('n')), +String(f.get('l')), String(f.get('x')));
    e.currentTarget.reset();
  };
  const onCreateSub = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = createSubIssue(String(f.get('p')), String(f.get('sy')), +String(f.get('z')), String(f.get('t')));
    if (id) router.push('/oup?doc=' + id);
  };

  return (
    <PageShell view="cprog" title="โครงการ MTN" subtitle="สร้างโครงการหลัก แล้วออกรุ่นย่อยโดยผูกกับโครงการ (หน่วย: ล้านบาท)">
      <DataTable
        headers={['รหัส', 'โครงการ', 'วงเงินรวม', 'ใช้ไป', 'คงเหลือ', 'หมดอายุ']}
        rows={projects.map((p) => [
          p.id,
          p.n,
          nf(p.limit),
          nf(p.used),
          <b key="r" className={alive(p.exp) ? 'text-accent' : 'text-danger'}>{nf(p.limit - p.used)}</b>,
          p.exp + (alive(p.exp) ? '' : ' (หมดอายุ)'),
        ])}
      />

      <Card $wide className="mt-5">
        <h3>สร้างโครงการ MTN ใหม่</h3>
        <form onSubmit={onCreateProject}>
          <Field label="ชื่อโครงการ"><Input name="n" required /></Field>
          <Field label="วงเงินรวม (ล้านบาท)"><Input name="l" type="number" min={1} required /></Field>
          <Field label="วันหมดอายุโครงการ"><Input name="x" type="date" required /></Field>
          <div><Button type="submit">สร้างโครงการ</Button></div>
        </form>
      </Card>

      <Card $wide>
        <h3>สร้างรุ่นย่อยภายใต้โครงการ</h3>
        <form onSubmit={onCreateSub}>
          <Field label="โครงการ MTN">
            <Select name="p">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {`${p.id} ${p.n} · คงเหลือ ${nf(p.limit - p.used)}${alive(p.exp) ? '' : ' (หมดอายุ)'}`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Symbol รุ่นใหม่"><Input name="sy" required /></Field>
          <Field label="มูลค่าที่เสนอขาย (ล้านบาท)"><Input name="z" type="number" min={1} required /></Field>
          <Field label="อายุ"><Input name="t" defaultValue="3 ปี" required /></Field>
          <div><Button type="submit">สร้างรุ่นย่อยและแนบเอกสาร</Button></div>
        </form>
      </Card>
    </PageShell>
  );
}
