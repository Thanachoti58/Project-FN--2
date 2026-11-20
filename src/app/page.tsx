import { redirect } from 'next/navigation';

/** หน้าแรก "/" → แสดงหน้าเข้าสู่ระบบ (ถ้าล็อกอินอยู่จะไปหน้าหลักหลัง hydrate) */
export default function IndexPage() {
  redirect('/login');
}
