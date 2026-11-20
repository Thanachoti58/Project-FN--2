'use client';
/** ปุ่ม "แก้ไข" และ "กรอกเอกสาร" ของรายการฝั่งบริษัท (ใช้หลายหน้า) */
import { useRouter } from 'next/navigation';
import type { Bond } from '@/types';
import { canTouch, editName } from '@/store';
import { Button } from '@/components/ui/Button';

export function CompanyRowActions({ bond, disabled = false, outline = false }: { bond: Bond; disabled?: boolean; outline?: boolean }) {
  const router = useRouter();
  return (
    <>
      <Button variant={outline ? 'outline' : 'primary'} disabled={disabled} onClick={() => editName(bond.id)}>
        แก้ไข
      </Button>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => canTouch(bond.id) && router.push('/oup?doc=' + bond.id)}
      >
        กรอกเอกสาร
      </Button>
    </>
  );
}
