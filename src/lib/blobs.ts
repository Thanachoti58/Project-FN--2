const DB_NAME = 'mbond-attachments';
const STORE_NAME = 'files';
const urls = new Map<string, string>();
const loads = new Map<string, Promise<string | undefined>>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error ?? new Error('เปิดที่เก็บไฟล์แนบไม่สำเร็จ'));
  });
}

async function transactionDone(db: IDBDatabase, operation: (store: IDBObjectStore) => IDBRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    operation(tx.objectStore(STORE_NAME));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('บันทึกไฟล์แนบไม่สำเร็จ'));
    tx.onabort = () => reject(tx.error ?? new Error('บันทึกไฟล์แนบถูกยกเลิก'));
  });
}

export async function setBlob(key: string, source: Blob | string): Promise<void> {
  const blob = typeof source === 'string'
    ? await fetch(source).then((response) => {
        if (!response.ok) throw new Error('อ่านไฟล์แนบไม่สำเร็จ');
        return response.blob();
      })
    : source;
  const db = await openDb();
  try {
    await transactionDone(db, (store) => store.put(blob, key));
  } finally {
    db.close();
  }
  const previous = urls.get(key);
  if (previous) URL.revokeObjectURL(previous);
  urls.set(key, URL.createObjectURL(blob));
}

export async function getBlob(key: string): Promise<string | undefined> {
  const cached = urls.get(key);
  if (cached) return cached;
  const pending = loads.get(key);
  if (pending) return pending;

  const load = (async () => {
    const db = await openDb();
    try {
      const blob = await new Promise<Blob | undefined>((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result as Blob | undefined);
        request.onerror = () => reject(request.error ?? new Error('อ่านไฟล์แนบไม่สำเร็จ'));
      });
      if (!blob) return undefined;
      const url = URL.createObjectURL(blob);
      urls.set(key, url);
      return url;
    } finally {
      db.close();
    }
  })();
  loads.set(key, load);
  try {
    return await load;
  } finally {
    loads.delete(key);
  }
}

export async function deleteBlob(key: string): Promise<void> {
  const db = await openDb();
  try {
    await transactionDone(db, (store) => store.delete(key));
  } finally {
    db.close();
  }
  const url = urls.get(key);
  if (url) URL.revokeObjectURL(url);
  urls.delete(key);
}

export async function clearBlobs(): Promise<void> {
  const db = await openDb();
  try {
    await transactionDone(db, (store) => store.clear());
  } finally {
    db.close();
  }
  urls.forEach((url) => URL.revokeObjectURL(url));
  urls.clear();
}
