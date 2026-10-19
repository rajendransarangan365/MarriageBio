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

  async exportBackup(includeImages: boolean = true, format: 'vclone' | 'json' = 'vclone'): Promise<{ jsonString: string; filename: string }> {
    const rawProfiles = await this.getAllProfiles();
    const profiles = includeImages
      ? rawProfiles
      : rawProfiles.map((p) => ({
          ...p,
          photoUri: null,
          photoOriginalUri: null,
        }));

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = includeImages
      ? `TamilMarriageBio_Backup_${dateStr}.${format}`
      : `TamilMarriageBio_DataOnly_${dateStr}.json`;

    const backupObj = {
      app: 'TamilMarriageBiodataBuilder',
      format: format === 'vclone' ? 'vclone' : 'json',
      version: '1.0.0',
      includeImages,
      exportedAt: new Date().toISOString(),
      profileCount: profiles.length,
      profiles,
    };

    return {
      jsonString: JSON.stringify(backupObj, null, 2),
      filename,
    };
  },

  async downloadBackup(
    includeImages: boolean = true,
    format: 'vclone' | 'json' = 'vclone'
  ): Promise<{ success: boolean; message: string; filename: string; url?: string; isDirectLink?: boolean }> {
    try {
      const { jsonString, filename } = await this.exportBackup(includeImages, format);

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const mimeType = 'application/json;charset=utf-8';
        const blob = new Blob([jsonString], { type: mimeType });

        // 1. On PC Chrome / Edge: Native File System Access Picker
        if (typeof (window as any).showSaveFilePicker === 'function') {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: filename,
              types: [
                {
                  description: format === 'vclone' ? 'Tamil Biodata Clone (*.vclone)' : 'JSON Data (*.json)',
                  accept: {
                    'application/json': [`.${format}`],
                  },
                },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return {
              success: true,
              message: `"${handle.name}" கோப்பு வெற்றிகரமாக சேமிக்கப்பட்டது!`,
              filename: handle.name,
            };
          } catch (pickErr: any) {
            if (pickErr.name === 'AbortError') {
              return {
                success: false,
                message: 'சேமிப்பது ரத்து செய்யப்பட்டது.',
                filename,
              };
            }
            // If picker not allowed or failed, fallback below
          }
        }

        // 2. On Mobile Android: Web Share API with File
        if (
          typeof navigator !== 'undefined' &&
          typeof (navigator as any).canShare === 'function' &&
          typeof (window as any).File === 'function'
        ) {
          try {
            const file = new File([blob], filename, { type: 'application/json' });
            if ((navigator as any).canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: filename,
                text: 'தமிழ் திருமண பயோடேட்டா காப்புநகல் (.vclone)',
              });
              return {
                success: true,
                message: `"${filename}" கோப்பு வெற்றிகரமாக சேமிக்கப்பட்டது / பகிரப்பட்டது!`,
                filename,
              };
            }
          } catch (shareErr: any) {
            if (shareErr.name === 'AbortError') {
              return {
                success: false,
                message: 'பகிர்வு ரத்து செய்யப்பட்டது.',
                filename,
              };
            }
          }
        }

        // 3. Standard Anchor Trigger with Persistent Blob URL
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);

        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        link.dispatchEvent(clickEvent);

        // Keep Blob URL active for 2 minutes so Android and PC download managers never abort
        setTimeout(() => {
          link.remove();
          URL.revokeObjectURL(url);
        }, 120000);

        return {
          success: true,
          message: `"${filename}" பதிவிறக்கம் தொடங்கப்பட்டது!`,
          filename,
          url,
          isDirectLink: true,
        };
      }

      return {
        success: true,
        message: 'காப்புநகல் உருவாக்கப்பட்டது.',
        filename,
      };
    } catch (e: any) {
      console.error('Download backup error:', e);
      return {
        success: false,
        message: `காப்புநகல் பதிவிறக்குவதில் சிக்கல்: ${e.message}`,
        filename: '',
      };
    }
  },

  async importBackup(jsonString: string): Promise<{ success: boolean; count: number; hasImages: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonString.trim());
      const profilesList: BiodataProfile[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.profiles)
        ? parsed.profiles
        : [];

      if (!profilesList || profilesList.length === 0) {
        return {
          success: false,
          count: 0,
          hasImages: false,
          message: 'செல்லுபடியாகாத காப்புநகல் கோப்பு வடிவம் (சுயவிவரங்கள் காணப்படவில்லை).',
        };
      }

      const existingList = await this.getAllProfiles();
      const existingIds = new Set(existingList.map((p) => p.id));
      let addedCount = 0;
      let hasImages = false;

      for (const importedProfile of profilesList) {
        if (importedProfile.photoUri) {
          hasImages = true;
        }
        if (!importedProfile.id || existingIds.has(importedProfile.id)) {
          importedProfile.id = `profile_restored_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        }
        existingList.unshift(importedProfile);
        addedCount++;
      }

      setItemSync(STORAGE_PROFILES_KEY, JSON.stringify(existingList));
      if (existingList.length > 0) {
        setItemSync(STORAGE_DRAFT_KEY, JSON.stringify(existingList[0]));
      }

      const fileTypeLabel = parsed.format === 'vclone' ? '.vclone' : '.json';
      const imageLabel = hasImages ? 'படங்கள் & புகைப்பட அமைப்புகள் உட்பட ' : 'தரவு மட்டும் ';

      return {
        success: true,
        count: addedCount,
        hasImages,
        message: `${addedCount} சுயவிவரங்கள் (${fileTypeLabel} ${imageLabel}) வெற்றிகரமாக மீட்டமைக்கப்பட்டன!`,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        hasImages: false,
        message: `மீட்டமைப்பதில் பிழை: ${err.message}`,
      };
    }
  },
};
