import type { Status } from '@/types';

/** ป้ายสถานะ: [ข้อความ, สี] */
export const STATUS: Record<Status, [string, string]> = {
  draft: ['ร่าง', '#8FAAA4'],
  pending: ['รอตรวจสอบ', '#FBBF24'],
  approving: ['รออนุมัติ', '#60A5FA'],
  returned: ['ส่งกลับแก้ไข', '#F87171'],
  approved: ['รอเผยแพร่', '#A78BFA'],
  published: ['เผยแพร่แล้ว', '#2FE6A6'],
  rejected: ['ปฏิเสธ', '#F87171'],
  submitted: ['รอ Document ตรวจ', '#38BDF8'],
  cancelled: ['ยกเลิก', '#94A3B8'],
};

/** ลำดับสถานะของ workflow หลัก */
export const FLOW: Status[] = ['draft', 'submitted', 'pending', 'approving', 'approved', 'published'];

/** สถานะทั้งหมด เรียงตามที่แสดงในกราฟแท่ง */
export const ALL_STATUSES: Status[] = [
  'draft',
  'submitted',
  'pending',
  'approving',
  'approved',
  'published',
  'returned',
  'cancelled',
  'rejected',
];

/** สถานะที่ถือว่า "อยู่ระหว่างตรวจสอบ" */
export const IN_REVIEW: Status[] = ['submitted', 'pending', 'approving', 'approved'];
