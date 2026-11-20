'use client';
/**
 * useStore — subscribe เข้ากับ store กลาง (ใช้ useSyncExternalStore)
 * คอมโพเนนต์ที่เรียก hook นี้จะ render ใหม่ทุกครั้งที่ข้อมูลใน store เปลี่ยน
 */
import { useSyncExternalStore } from 'react';
import { getVersion, store, subscribe } from '@/store';

export function useStore() {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return store;
}
