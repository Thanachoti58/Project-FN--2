'use client';
import { useSearchParams } from 'next/navigation';

/** อ่าน query string ของหน้า เช่น /oup?doc=DB-015 */
export function useQueryParam(key: string): string {
  return useSearchParams().get(key) ?? '';
}
