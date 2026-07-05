import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MediGuardianDB extends DBSchema {
  vitals: {
    key: string;
    value: {
      id: string;
      type: string;
      value: number | string;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-synced': boolean };
  };
  medications: {
    key: string;
    value: {
      id: string;
      name: string;
      dosage: string;
      taken: boolean;
      time: number;
      synced: boolean;
    };
    indexes: { 'by-synced': boolean };
  };
}

let dbPromise: Promise<IDBPDatabase<MediGuardianDB>>;

export function initDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<MediGuardianDB>('mediguardian-store', 1, {
      upgrade(db) {
        const vitalsStore = db.createObjectStore('vitals', { keyPath: 'id' });
        vitalsStore.createIndex('by-synced', 'synced');

        const medStore = db.createObjectStore('medications', { keyPath: 'id' });
        medStore.createIndex('by-synced', 'synced');
      },
    });
  }
  return dbPromise;
}

export async function addVitalOffline(vital: Omit<MediGuardianDB['vitals']['value'], 'id' | 'synced'>) {
  const db = await initDB();
  if (!db) return;
  const id = crypto.randomUUID();
  await db.add('vitals', { ...vital, id, synced: false });
}

export async function logMedicationOffline(medication: Omit<MediGuardianDB['medications']['value'], 'id' | 'synced'>) {
  const db = await initDB();
  if (!db) return;
  const id = crypto.randomUUID();
  await db.add('medications', { ...medication, id, synced: false });
}

export async function getUnsyncedData() {
  const db = await initDB();
  if (!db) return { vitals: [], medications: [] };

  const txVitals = db.transaction('vitals', 'readonly');
  const indexVitals = txVitals.store.index('by-synced');
  const unsyncedVitals = await indexVitals.getAll(false);

  const txMeds = db.transaction('medications', 'readonly');
  const indexMeds = txMeds.store.index('by-synced');
  const unsyncedMeds = await indexMeds.getAll(false);

  return { vitals: unsyncedVitals, medications: unsyncedMeds };
}

export async function markAsSynced(type: 'vitals' | 'medications', id: string) {
  const db = await initDB();
  if (!db) return;
  const item = await db.get(type, id);
  if (item) {
    item.synced = true;
    await db.put(type, item);
  }
}
