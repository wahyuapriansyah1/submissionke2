import Api from '../../../api';
import Auth from '../../../utils/auth';
import { getAllData, deleteData, saveData } from '../../../utils/idb';

/**
 * Kelas model untuk halaman tambah cerita
 * Mengelola operasi data dan logika bisnis
 */
export default class AddStoryModel {
  constructor() {
    this._offlineStories = [];
  }

  /**
   * Memeriksa status autentikasi pengguna
   * @returns {boolean} True jika pengguna sudah terautentikasi
   */
  isAuthenticated() {
    return Auth.isAuthenticated();
  }

  /**
   * Mendapatkan data pengguna saat ini
   * @returns {Object|null} Data pengguna atau null jika belum terautentikasi
   */
  getUserData() {
    return Auth.getUserData();
  }

  /**
   * Menambahkan cerita baru
   * @param {FormData} formData - Data form yang berisi detail cerita
   * @returns {Promise<Object>} Data respons dengan status keberhasilan
   */
  async addStory(formData) {
    const user = this.getUserData();
    
    if (!user || !user.accessToken) {
      throw new Error('Pengguna belum terautentikasi');
    }

    try {
      console.log('Mengirim cerita ke API...');
      const responseData = await Api.stories.create(formData);
      console.log('Respons API:', responseData);

      if (!responseData.error) {
        // Jika ini adalah cerita offline, hapus dari IndexedDB
        const description = formData.get('description');
        const stories = await getAllData('offline-stories');
        const offlineStory = stories.find(story => 
          story.isOffline && story.description === description
        );
        
        if (offlineStory) {
          console.log('Menghapus cerita offline dari IndexedDB:', offlineStory.id);
          await deleteData(offlineStory.id, 'offline-stories');
          console.log('Berhasil menghapus cerita offline dari IndexedDB');
        }

        return {
          success: true,
          message: 'Cerita berhasil ditambahkan'
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Gagal menambahkan cerita'
        };
      }
    } catch (error) {
      console.error('Kesalahan saat menambahkan cerita:', error);
      throw new Error('Gagal menambahkan cerita. Silakan coba lagi nanti.');
    }
  }

  /**
   * Memvalidasi input cerita
   * @param {Object} data - Data cerita yang akan divalidasi
   * @returns {Object} Hasil validasi dengan status dan pesan
   */
  validateStoryInput(data) {
    const { description, file, capturedBlob, includeLocation, lat, lon } = data;

    if (!description) {
      return {
        valid: false,
        message: 'Silakan masukkan deskripsi cerita'
      };
    }

    if (!file && !capturedBlob) {
      return {
        valid: false,
        message: 'Silakan pilih atau ambil foto'
      };
    }

    if (file && file.size > 1024 * 1024) {
      return {
        valid: false,
        message: 'Ukuran file harus kurang dari 1MB'
      };
    }

    if (includeLocation && (!lat || !lon)) {
      return {
        valid: false,
        message: 'Silakan pilih lokasi di peta atau gunakan lokasi saat ini'
      };
    }

    return {
      valid: true
    };
  }

  /**
   * Menyinkronkan cerita offline dengan server
   */
  async syncOfflineStories() {
    try {
      // Mendapatkan semua cerita offline
      const offlineStories = await getAllData('offline-stories');
      
      for (const story of offlineStories) {
        try {
          // Membuat FormData dari cerita offline
          const formData = new FormData();
          formData.append('description', story.description);
          
          // Mengkonversi base64 ke Blob jika diperlukan
          if (story.photoUrl && story.photoUrl.startsWith('data:')) {
            const response = await fetch(story.photoUrl);
            const blob = await response.blob();
            formData.append('photo', blob, 'photo.jpg');
          }
          
          // Menambahkan lokasi jika tersedia
          if (story.lat && story.lon) {
            formData.append('lat', story.lat);
            formData.append('lon', story.lon);
          }

          // Mencoba mengirim cerita
          const user = this.getUserData();
          if (user && user.accessToken) {
            await Api.stories.create(formData);
            // Jika berhasil, hapus dari IndexedDB
            await deleteData(story.id, 'offline-stories');
          }
        } catch (error) {
          console.error('Kesalahan saat menyinkronkan cerita:', error);
          // Lanjutkan dengan cerita berikutnya meskipun satu gagal
          continue;
        }
      }
    } catch (error) {
      console.error('Kesalahan dalam syncOfflineStories:', error);
      throw new Error('Gagal menyinkronkan cerita offline');
    }
  }
} 