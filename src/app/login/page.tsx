'use client';
/**
 * LOGIN PAGE — หน้าเข้าสู่ระบบ
 *  ซ้าย: ภาพแบรนด์   ขวา: ฟอร์มล็อกอิน
 */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IMAGES } from '@/constants';
import { login } from '@/store';
import { useStore } from '@/hooks/useStore';

export default function LoginPage() {
  const { session } = useStore();
  const router = useRouter();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  // ล็อกอินอยู่แล้ว → เข้าหน้าหลัก
  useEffect(() => {
    if (session.user) router.replace('/home');
  }, [session.user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(user, pass, false);
    if (err) setError(err);
    else router.replace('/home');
  };

  return (
    <div className="login-wrap">
      {/* ---------- ซ้าย: แบรนด์ ---------- */}
      <div className="login-left">
        <i className="s1" />
        <i className="s2" />
        <i className="s3" />
        <div className="relative text-white">
          <Image src={IMAGES.logo} alt="M-Bond ระบบตราสารหนี้" width={210} height={238} priority className="mb-9 block h-auto w-[210px] max-w-full" />
          <h1 className="mb-2 mt-0 text-[34px]">ระบบจัดการตราสารหนี้</h1>
          <p className="mb-5 mt-0 text-[#cfe5da]">Thai Bond Management System</p>
          <u className="mb-[22px] block h-1 w-[50px] rounded bg-[#3fbf73] no-underline" />
          <h4 className="mb-2 mt-0 text-[15px]">ระบบสำหรับเจ้าหน้าที่หลังบ้าน</h4>
          <p className="m-0 text-[13px] leading-[1.7] text-[#cfe5da]">
            จัดการข้อมูลตราสารหนี้และเอกสาร
            <br />
            ได้อย่างเป็นระบบ ปลอดภัย และตรวจสอบได้
          </p>
        </div>
      </div>

      {/* ---------- ขวา: ฟอร์ม ---------- */}
      <div className="login-right">
        <div className="login-card">
          <h2>เข้าสู่ระบบ</h2>
          <p className="sub">ลงชื่อเข้าใช้เพื่อจัดการข้อมูลตราสารหนี้</p>

          <form onSubmit={submit} className="!block">
            <label className="lbl" htmlFor="lu">ชื่อผู้ใช้งาน (อีเมล)</label>
            <div className="fi">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
              <input id="lu" autoComplete="username" placeholder="กรอกอีเมล" required value={user} onChange={(e) => setUser(e.target.value)} autoFocus />
            </div>

            <label className="lbl" htmlFor="lp">รหัสผ่าน</label>
            <div className="fi">
              <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              <input id="lp" type={showPass ? 'text' : 'password'} autoComplete="current-password" placeholder="กรอกรหัสผ่าน" required value={pass} onChange={(e) => setPass(e.target.value)} />
              <button type="button" className="eye" aria-label="แสดงหรือซ่อนรหัสผ่าน" onClick={() => setShowPass((v) => !v)}>
                <svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
            </div>

            <div className="my-4 mb-1.5 flex items-center justify-end">
              <a href="#" className="text-[12.5px] font-bold text-[#13683f]" onClick={(e) => { e.preventDefault(); setError('กรุณาติดต่อ admin เพื่อรีเซ็ตรหัสผ่าน'); }}>
                ลืมรหัสผ่าน?
              </a>
            </div>

            <p className="my-1.5 min-h-[20px] text-[13px] text-[#c0392b]" role="alert">{error}</p>
            <button className="go" type="submit">เข้าสู่ระบบ <span>→</span></button>
          </form>

          <div className="my-[22px] mb-3.5 h-px bg-[#e1ebe5]" />
          <p className="m-0 text-center text-xs text-[#6b857a]">สำหรับเจ้าหน้าที่ที่ได้รับสิทธิ์เข้าใช้งานระบบเท่านั้น</p>
        </div>
        <p className="m-0 text-center text-xs text-[#6b857a]">© Thai Bond Management System · เอกสารและข้อมูลสำหรับใช้ภายในองค์กร</p>
      </div>
    </div>
  );
}
