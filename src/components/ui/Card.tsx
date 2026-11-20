'use client';
/** Card — การ์ดพื้นหลังเขียวเข้ม (twin.macro) wide = ไม่จำกัดความกว้าง */
import tw, { styled } from 'twin.macro';

export const Card = styled.div<{ $wide?: boolean; $flush?: boolean }>(({ $wide, $flush }) => [
  tw`mb-5 rounded-[14px] border border-solid border-line bg-card p-5 transition-colors hover:border-[#24504a]`,
  !$wide && tw`max-w-[760px]`,
  $flush && tw`mb-0`,
]);

/** Chip — ปุ่มเลือกเหตุผลแบบสั้น */
export const Chip = styled.button(() => [
  tw`cursor-pointer rounded-[20px] border border-solid border-line bg-surface px-3 py-1.5 text-xs text-ink`,
  tw`hover:(border-accent text-accent)`,
]);
