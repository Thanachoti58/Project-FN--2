'use client';
/** Badge — ป้ายสถานะ (twin.macro) สีมาจาก constants/status */
import tw, { styled } from 'twin.macro';
import type { Status } from '@/types';
import { STATUS } from '@/constants';

const Pill = styled.span<{ $color: string }>(({ $color }) => [
  tw`inline-block rounded-full px-2.5 py-[3px] text-xs`,
  { color: $color, backgroundColor: `color-mix(in srgb, ${$color} 15%, transparent)` },
]);

export function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <Pill $color={color}>{children}</Pill>;
}

/** ป้ายสถานะเอกสาร (ใส่ label เองได้ เช่น "ใช้งาน") */
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const [text, color] = STATUS[status];
  return <Badge color={color}>{label ?? text}</Badge>;
}
