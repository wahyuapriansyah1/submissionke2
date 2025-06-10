import { openDB } from 'idb';

const DATABASE_NAME = 'offline-stories';
const DATABASE_VERSION = 1;
const OBJECT_STORES = {
  OFFLINE_STORIES: 'offline-stories',
  STORIES: 'stories',
  IMAGES: 'images'
};

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORES.OFFLINE_STORIES)) {
      database.createObjectStore(OBJECT_STORES.OFFLINE_STORIES, { keyPath: 'id' });
    }
    
    if (!database.objectStoreNames.contains(OBJECT_STORES.STORIES)) {
      database.createObjectStore(OBJECT_STORES.STORIES, { keyPath: 'id' });
    }
    
    if (!database.objectStoreNames.contains(OBJECT_STORES.IMAGES)) {
      database.createObjectStore(OBJECT_STORES.IMAGES, { keyPath: 'url' });
    }
  },
});

/**
 * Menyimpan data ke IndexedDB
 * @param {Object} data - Data yang akan disimpan
 * @param {string} storeName - Nama object store (default: 'offline-stories')
 * @returns {Promise<string>} ID data yang disimpan
 */
export const saveData = async (data, storeName = OBJECT_STORES.OFFLINE_STORIES) => {
  console.log('Saving data:', data);
  const db = await dbPromise;
  console.log('Database opened successfully');
  await db.put(storeName, data);
  console.log('Data saved successfully:', data.id);
  return data.id;
};

/**
 * Mengambil semua data dari IndexedDB
 * @param {string} storeName - Nama object store (default: 'offline-stories')
 * @returns {Promise<Array>} Array of data
 */
export const getAllData = async (storeName = OBJECT_STORES.OFFLINE_STORIES) => {
  console.log('Getting all data');
  const db = await dbPromise;
  console.log('Database opened successfully');
  const data = await db.getAll(storeName);
  console.log('All data retrieved successfully');
  return data;
};

/**
 * Mengambil data berdasarkan ID dari IndexedDB
 * @param {string} id - ID data yang akan diambil
 * @param {string} storeName - Nama object store (default: 'offline-stories')
 * @returns {Promise<Object>} Data yang diambil
 */
export const getDataById = async (id, storeName = OBJECT_STORES.OFFLINE_STORIES) => {
  const db = await dbPromise;
  return db.get(storeName, id);
};

/**
 * Menghapus data dari IndexedDB
 * @param {string} id - ID data yang akan dihapus
 * @param {string} storeName - Nama object store (default: 'offline-stories')
 * @returns {Promise<void>}
 */
export const deleteData = async (id, storeName = OBJECT_STORES.OFFLINE_STORIES) => {
  console.log('Deleting data:', id);
  const db = await dbPromise;
  console.log('Database opened successfully');
  await db.delete(storeName, id);
  console.log('Data deleted successfully:', id);
};

/**
 * Menyimpan gambar ke IndexedDB
 * @param {string} url - URL gambar
 * @param {Blob} blob - Blob gambar
 * @returns {Promise<void>}
 */
export const saveImage = async (url, blob) => {
  const db = await dbPromise;
  await db.put(OBJECT_STORES.IMAGES, { url, blob });
};

/**
 * Mengambil gambar dari IndexedDB
 * @param {string} url - URL gambar
 * @returns {Promise<Blob>} Blob gambar
 */
export const getImage = async (url) => {
  const db = await dbPromise;
  const data = await db.get(OBJECT_STORES.IMAGES, url);
  return data ? data.blob : null;
}; 