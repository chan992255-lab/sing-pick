// 녹음 파일 저장소 — IndexedDB (localStorage 는 오디오 Blob 을 담기엔 너무 작다)

export interface SavedRecording {
  id: string;
  title: string;
  songId?: string;
  singer?: string;
  createdAt: number;
  duration: number;
  size: number;
  mime: string;
  blob: Blob;
}

const DB_NAME = 'singpick';
const STORE = 'recordings';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 를 열 수 없습니다'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('저장소 요청이 실패했습니다'));
    tx.oncomplete = () => db.close();
  });
}

export async function listRecordings(): Promise<SavedRecording[]> {
  const all = await withStore<SavedRecording[]>('readonly', (s) => s.getAll() as IDBRequest<SavedRecording[]>);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveRecording(rec: SavedRecording): Promise<void> {
  await withStore('readwrite', (s) => s.put(rec) as IDBRequest<IDBValidKey>);
}

export async function deleteRecording(id: string): Promise<void> {
  await withStore('readwrite', (s) => s.delete(id) as IDBRequest<undefined>);
}
