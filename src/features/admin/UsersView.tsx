'use client';
/** USERS (admin) — จัดการเจ้าหน้าที่ภายใน + ชวนผู้ใช้บริษัท + คำเชิญ */
import type { Role } from '@/types';
import { ROLES } from '@/constants';
import { useStore } from '@/hooks/useStore';
import { acceptInvite, addStaff, inviteUser, resendInvite, revokeInvite, toggleUser } from '@/store';
import { PageShell } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Input, Select } from '@/components/ui/Field';
import { SectionTitle } from '@/components/ui/Misc';

const STAFF_ROLES: Role[] = ['admin', 'officer', 'manager'];

export function UsersView() {
  const { data } = useStore();
  const indexed = data.U.map((u, i) => [u, i] as const);
  const staff = indexed.filter(([u]) => u.r !== 'company');
  const customers = indexed.filter(([u]) => u.r === 'company');

  const status = (on: boolean) => <StatusBadge status={on ? 'published' : 'rejected'} label={on ? 'ใช้งาน' : 'ปิดใช้งาน'} />;
  const email = (u: { email: string; mail?: string }) => (
    <>
      {u.mail || u.email}
      {u.mail && (
        <>
          <br />
          <small className="text-muted">
            ล็อกอินด้วย: <code>{u.email}</code>
          </small>
        </>
      )}
    </>
  );

  const onAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (addStaff(String(f.get('n')), String(f.get('email')), String(f.get('r')) as Role)) e.currentTarget.reset();
  };
  const onInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (inviteUser(String(f.get('email')), String(f.get('rep')), String(f.get('co')))) e.currentTarget.reset();
  };

  return (
    <PageShell
      view="users"
      title="จัดการผู้ใช้งาน"
      subtitle="เจ้าหน้าที่พนักงานเพิ่มได้โดยตรง ส่วนผู้ใช้บริษัทต้องชวนผ่านอีเมลและรอให้ตอบรับคำเชิญ"
    >
      {/* ---------- เจ้าหน้าที่พนักงาน ---------- */}
      <SectionTitle>เจ้าหน้าที่พนักงาน</SectionTitle>
      <Card $wide>
        <form onSubmit={onAddStaff}>
          <div className="flex flex-wrap gap-2.5">
            <Input name="n" placeholder="ชื่อ-นามสกุล" required />
            <Input name="email" type="email" placeholder="อีเมลองค์กร" required />
            <Select name="r" aria-label="Role">
              {STAFF_ROLES.map((k) => (
                <option key={k} value={k}>{ROLES[k].name}</option>
              ))}
            </Select>
            <Button type="submit">เพิ่มเจ้าหน้าที่</Button>
          </div>
        </form>
      </Card>
      <DataTable
        headers={['ชื่อ', 'Role', 'อีเมล', 'สถานะ', '']}
        rows={staff.map(([u, i]) => [u.n, ROLES[u.r].name, email(u), status(u.on), <Button key="t" variant="outline" onClick={() => toggleUser(i)}>{u.on ? 'ปิด' : 'เปิด'}</Button>])}
      />

      {/* ---------- ผู้ใช้บริษัท ---------- */}
      <SectionTitle className="!mt-7">ผู้ใช้บริษัท</SectionTitle>
      <Card $wide>
        <form onSubmit={onInvite}>
          <div className="flex flex-wrap gap-2.5">
            <Input name="email" type="email" placeholder="อีเมล" required />
            <Input name="rep" placeholder="ชื่อผู้แทนบริษัท" required />
            <Input name="co" list="colist" placeholder="ชื่อบริษัท" required />
            <datalist id="colist">
              {data.CO.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Button type="submit">ชวนผู้ใช้</Button>
          </div>
        </form>
      </Card>

      <SectionTitle muted>คำเชิญที่รอตอบรับ</SectionTitle>
      <DataTable
        headers={['ชื่อผู้แทน', 'อีเมล', 'บริษัท', 'ชวนเมื่อ', 'สถานะ', '']}
        rows={data.INV.map((v, i) => [
          v.rep,
          v.email,
          v.co,
          v.t,
          <StatusBadge key="s" status="pending" label="รอตอบรับ" />,
          <span key="a">
            <Button variant="outline" onClick={() => resendInvite(i)}>ส่งซ้ำ</Button>
            <Button variant="outline" onClick={() => acceptInvite(i)}>จำลองการตอบรับ</Button>
            <Button variant="danger" onClick={() => revokeInvite(i)}>ยกเลิกคำเชิญ</Button>
          </span>,
        ])}
      />

      <SectionTitle muted>ผู้ใช้บริษัทที่ตอบรับแล้ว</SectionTitle>
      <DataTable
        headers={['ชื่อผู้แทน', 'บริษัท', 'อีเมล', 'สถานะ', '']}
        rows={customers.map(([u, i]) => [u.n, u.co, email(u), status(u.on), <Button key="t" variant="outline" onClick={() => toggleUser(i)}>{u.on ? 'ปิด' : 'เปิด'}</Button>])}
      />
    </PageShell>
  );
}
