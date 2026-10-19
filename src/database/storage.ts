import { BiodataProfile, createDefaultProfile } from '../types/biodata';

const STORAGE_PROFILES_KEY = '@tamil_biodata_profiles_v1';
const STORAGE_DRAFT_KEY = '@tamil_biodata_active_draft_v1';
const STORAGE_SETTINGS_KEY = '@tamil_biodata_settings_v1';

// Robust Storage Engine: Memory-First Cache + IndexedDB + LocalStorage fallback
const memoryStorage: Record<string, string> = {};

// Simple promise-based IndexedDB key-value store for web
const IDB_DB_NAME = 'TamilBiodataDB';
const IDB_STORE_NAME = 'biodata_store';

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(IDB_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  const db = await openIDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getItemAsync(key: string): Promise<string | null> {
  if (memoryStorage[key]) {
    return memoryStorage[key];
  }
  // Try IndexedDB first (holds uncompressed high-res images with zero quota limits)
  const idbVal = await idbGet(key);
  if (idbVal) {
    memoryStorage[key] = idbVal;
    return idbVal;
  }
  // LocalStorage fallback
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = window.localStorage.getItem(key);
      if (val) {
        memoryStorage[key] = val;
        return val;
      }
    } catch {}
  }
  return null;
}

function setItemSync(key: string, value: string): void {
  memoryStorage[key] = value;
  // Background persist to IndexedDB and LocalStorage
  idbSet(key, value).catch(() => {});
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }
}

export const StorageService = {
  async getAllProfiles(): Promise<BiodataProfile[]> {
    try {
      const data = await getItemAsync(STORAGE_PROFILES_KEY);
      if (!data) {
        // Initialize with default sample profiles (1 Groom, 1 Bride) so user has immediate preview
        const defaultGroom = createDefaultProfile('groom');
        const defaultBride = createDefaultProfile('bride');
        const initialList = [defaultGroom, defaultBride];
        setItemSync(STORAGE_PROFILES_KEY, JSON.stringify(initialList));
        return initialList;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load profiles:', e);
      return [createDefaultProfile('groom')];
    }
  },

  async getProfileById(id: string): Promise<BiodataProfile | null> {
    const list = await this.getAllProfiles();
    return list.find((p) => p.id === id) || null;
  },

  async saveProfile(profile: BiodataProfile): Promise<void> {
    const list = await this.getAllProfiles();
    const existingIndex = list.findIndex((p) => p.id === profile.id);
    const updatedProfile = { ...profile, updatedAt: Date.now() };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedProfile;
    } else {
      list.unshift(updatedProfile);
    }

    setItemSync(STORAGE_PROFILES_KEY, JSON.stringify(list));
    setItemSync(STORAGE_DRAFT_KEY, JSON.stringify(updatedProfile));
  },

  async duplicateProfile(id: string): Promise<BiodataProfile | null> {
    const target = await this.getProfileById(id);
    if (!target) return null;

    const copy: BiodataProfile = {
      ...target,
      id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: `${target.fullName} (நகல்)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.saveProfile(copy);
    return copy;
  },

  async deleteProfile(id: string): Promise<void> {
    const list = await this.getAllProfiles();
    const filtered = list.filter((p) => p.id !== id);
    setItemSync(STORAGE_PROFILES_KEY, JSON.stringify(filtered));
  },

  async clearAllProfiles(): Promise<void> {
    setItemSync(STORAGE_PROFILES_KEY, JSON.stringify([]));
    const blank = createDefaultProfile('groom');
    setItemSync(STORAGE_DRAFT_KEY, JSON.stringify(blank));
  },

  async getActiveDraft(): Promise<BiodataProfile> {
    try {
      const draftData = await getItemAsync(STORAGE_DRAFT_KEY);
      if (draftData) {
        return JSON.parse(draftData);
      }
    } catch (e) {
      // Fallback
    }
    const all = await this.getAllProfiles();
    return all[0] || createDefaultProfile('groom');
  },

  async saveDraft(profile: BiodataProfile): Promise<void> {
    setItemSync(STORAGE_DRAFT_KEY, JSON.stringify({ ...profile, updatedAt: Date.now() }));
  },

  async exportBackup(): Promise<string> {
    const profiles = await this.getAllProfiles();
    const backupObj = {
      app: 'TamilMarriageBiodataBuilder',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profiles,
    };
    return JSON.stringify(backupObj, null, 2);
  },

  async importBackup(jsonString: string): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.profiles)) {
        return { success: false, count: 0, message: 'செல்லுபடியாகாத காப்புநகல் கோப்பு வடிவம் (Invalid Backup Format)' };
      }

      const existingList = await this.getAllProfiles();
      const existingIds = new Set(existingList.map((p) => p.id));
      let addedCount = 0;

      for (const importedProfile of parsed.profiles) {
        if (!importedProfile.id || existingIds.has(importedProfile.id)) {
          importedProfile.id = `profile_restored_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        }
        existingList.unshift(importedProfile);
        addedCount++;
      }

      setItemSync(STORAGE_PROFILES_KEY, JSON.stringify(existingList));
      return { success: true, count: addedCount, message: `${addedCount} சுயவிவரங்கள் வெற்றிகரமாக மீட்டமைக்கப்பட்டன!` };
    } catch (err: any) {
      return { success: false, count: 0, message: `மீட்டமைப்பதில் பிழை: ${err.message}` };
    }
  },
};
