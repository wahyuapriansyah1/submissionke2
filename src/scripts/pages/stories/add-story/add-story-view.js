import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddStoryModel from './add-story-model.js';
import AddStoryPresenter from './add-story-presenter.js';
import { saveData, getAllData, deleteData } from '../../../utils/idb.js';

/**
 * Kelas view untuk halaman tambah cerita
 * Menangani rendering dan interaksi UI
 */
export default class AddStoryView {
  #presenter;
  #model;
  #map;
  #marker;
  #mediaStream;
  #capturedBlob;

  constructor() {
    // Inisialisasi model dan presenter
    this.#model = new AddStoryModel();
    this.#presenter = new AddStoryPresenter({
      model: this.#model,
      view: this,
    });
    
    // Inisialisasi variabel instance
    this.#map = null;
    this.#marker = null;
    this.#mediaStream = null;
    this.#capturedBlob = null;
  }

  /**
   * Mengatur presenter untuk view ini
   * @param {Object} presenter - Instance presenter
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Merender konten halaman tambah cerita
   * @returns {string} String HTML untuk halaman tambah cerita
   */
  async render() {
    // Periksa apakah pengguna sudah terautentikasi
    if (!this.#model.isAuthenticated()) {
      return '';
    }

    return `
      <!-- Container Utama -->
      <section style="max-width: 800px; margin: 40px auto; padding: 20px;" role="main" aria-label="Tambah Cerita Baru">
        <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); padding: 30px;">
          <h2 style="text-align: center; margin-bottom: 30px; font-size: 28px; color: #333;">Tambah review kuliner Baru</h2>
          <!-- Form Tambah review -->
          <form id="addStoryForm" aria-label="Form pengiriman cerita">
            <!-- Deskripsi Cerita -->
            <div style="margin-bottom: 20px;">
              <label for="description" style="display: block; margin-bottom: 8px; font-weight: 600;">Deskripsi review</label>
              <textarea 
                id="description" 
                name="description"
                rows="4" 
                required
                style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
                aria-required="true"
              ></textarea>
            </div>

            <!-- Upload Foto -->
            <div class="mb-3">
              <label class="form-label">Unggah Foto</label>
              <input 
                type="file" 
                id="photoFile" 
                name="photo"
                accept="image/*" 
                style="width: 100%; margin-bottom: 10px;"
                aria-required="true"
              />

              <button 
                type="button" 
                id="openCameraBtn" 
                style="padding: 8px 12px; background-color:rgb(203, 139, 43); color: white; border: none; border-radius: 5px;"
                aria-label="Buka kamera untuk mengambil foto"
              >
                Buka Kamera
              </button>

              <!-- Preview Gambar -->
              <div id="previewContainer" style="margin-top: 10px; display: none;">
                <img id="imagePreview" src="" alt="Preview foto" style="max-width: 100%; border-radius: 10px;" />
              </div>
            </div>

            <!-- Modal Kamera -->
            <div id="cameraModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 9999; justify-content: center; align-items: center;" role="dialog" aria-label="Modal pengambilan foto">
              <div style="background: white; padding: 20px; border-radius: 10px; position: relative; width: 400px; max-width: 90%;">
                <video 
                  id="cameraStream" 
                  autoplay 
                  playsinline 
                  style="width: 100%; border-radius: 10px;"
                  aria-label="Preview kamera"
                ></video>
                <button 
                  id="captureBtn" 
                  style="margin-top: 10px; padding: 10px 15px; background-color:rgb(203, 139, 43); color: white; border: none; border-radius: 5px;"
                  aria-label="Ambil foto"
                >
                  Ambil Foto
                </button>
                <button 
                  id="closeCameraBtn" 
                  style="position: absolute; top: 10px; right: 10px; background-color: transparent; border: none; font-size: 20px; color: #333;"
                  aria-label="Tutup kamera"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- Opsi Lokasi -->
            <div style="margin-bottom: 20px;">
              <label style="display: flex; align-items: center;">
                <input 
                  type="checkbox" 
                  id="includeLocation" 
                  name="includeLocation"
                  style="margin-right: 10px;"
                  aria-label="Sertakan lokasi saya dalam cerita"
                >
                Sertakan Lokasi Saya
              </label>
              <button 
                type="button" 
                id="getCurrentLocation" 
                style="margin-top: 10px; padding: 8px 12px; background-color:hsl(49, 72.40%, 53.10%); color: white; border: none; border-radius: 5px; display: none;"
                aria-label="Gunakan lokasi saat ini"
              >
                Gunakan Lokasi Saat Ini
              </button>
            </div>

            <!-- Form Lokasi -->
            <div id="locationFields" style="display: none; margin-bottom: 20px;">
              <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1;">
                  <label for="latitude" style="display: block; margin-bottom: 8px; font-weight: 600;">Latitude</label>
                  <input 
                    type="number" 
                    id="latitude" 
                    name="lat"
                    step="any"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;"
                    readonly
                  >
                </div>
                <div style="flex: 1;">
                  <label for="longitude" style="display: block; margin-bottom: 8px; font-weight: 600;">Longitude</label>
                  <input 
                    type="number" 
                    id="longitude" 
                    name="lon"
                    step="any"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;"
                    readonly
                  >
                </div>
              </div>
              <!-- Container Peta -->
              <div id="mapContainer" style="height: 300px; margin-top: 10px; border-radius: 6px; overflow: hidden;" role="application" aria-label="Peta untuk memilih lokasi cerita"></div>
            </div>

            <!-- Tombol Submit -->
            <button 
              type="submit"
              style="width: 100%; background-color:rgb(204, 144, 75); color: #fff; border: none; padding: 12px; border-radius: 6px; font-size: 16px; cursor: pointer;"
              aria-label="Kirim cerita"
            >
              Kirim Cerita
            </button>
          </form>
        </div>
      </section>
    `;
  }

  /**
   * Mengatur event listener dan menginisialisasi halaman
   */
  async afterRender() {
    // Inisialisasi presenter
    this.#presenter.init();
    
    // Atur event listener
    this.#setupLocationEvents();
    this.#setupPhotoEvents();
    this.#setupFormSubmission();
    this.#setupOnlineSync();

    // Periksa apakah online dan memiliki cerita offline untuk dikirim
    if (navigator.onLine) {
      await this.#syncOfflineStories();
    }
  }

  /**
   * Mengatur event listener terkait lokasi
   */
  #setupLocationEvents() {
    const includeLocation = document.getElementById('includeLocation');
    const locationFields = document.getElementById('locationFields');
    const mapContainer = document.getElementById('mapContainer');
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    
    // Event listener untuk checkbox lokasi
    includeLocation.addEventListener('change', () => {
      if (includeLocation.checked) {
        locationFields.style.display = 'block';
        getCurrentLocationBtn.style.display = 'block';
        
        // Inisialisasi peta dengan sedikit delay
        setTimeout(() => {
          if (!this.#map) {
            this.#initMap();
          }
        }, 100);
      } else {
        locationFields.style.display = 'none';
        getCurrentLocationBtn.style.display = 'none';
        
        // Bersihkan peta
        if (this.#map) {
          this.#map.remove();
          this.#map = null;
          this.#marker = null;
        }
      }
    });
    
    // Event listener untuk tombol lokasi saat ini
    getCurrentLocationBtn.addEventListener('click', async () => {
      try {
        const location = await this.#presenter.getCurrentLocation();
        this.#updateLocationFields(location.latitude, location.longitude);
      } catch (error) {
        this.showError('Tidak dapat mendapatkan lokasi Anda. Pastikan layanan lokasi diaktifkan.');
      }
    });
  }

  /**
   * Menginisialisasi peta
   */
  #initMap() {
    const mapContainer = document.getElementById('mapContainer');
    
    // Buat peta berpusat di Jakarta secara default
    this.#map = L.map(mapContainer).setView([-6.2088, 106.8456], 13);

    // Tambahkan layer tile
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    
    // Tambahkan event klik ke peta
    this.#map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.#updateLocationFields(lat, lng);
    });
  }

  /**
   * Memperbarui field lokasi dan marker
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  #updateLocationFields(lat, lng) {
    // Perbarui field input
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    // Perbarui marker di peta
    if (this.#map) {
      // Hapus marker yang ada jika ada
      if (this.#marker) {
        this.#map.removeLayer(this.#marker);
      }
      
      // Tambahkan marker baru
      this.#marker = L.marker([lat, lng]).addTo(this.#map);
      
      // Pusatkan peta ke lokasi baru
      this.#map.setView([lat, lng], 15);
    }
  }

  /**
   * Mengatur event listener terkait foto
   */
  #setupPhotoEvents() {
    const photoFile = document.getElementById('photoFile');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const cameraStream = document.getElementById('cameraStream');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    
    // Preview upload file
    photoFile.addEventListener('change', () => {
      this.#capturedBlob = null;
      const file = photoFile.files[0];
      if (!file) return;
      
      if (file.size > 1024 * 1024) {
        this.showError('Ukuran file harus kurang dari 1MB');
        photoFile.value = '';
        previewContainer.style.display = 'none';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
    
    // Tombol buka kamera
    openCameraBtn.addEventListener('click', async () => {
      try {
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStream.srcObject = this.#mediaStream;
        cameraModal.style.display = 'flex';
      } catch (error) {
        this.showError('Tidak dapat mengakses kamera');
      }
    });
    
    // Tombol ambil foto
    captureBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = cameraStream.videoWidth;
      canvas.height = cameraStream.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cameraStream, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob.size > 1024 * 1024) {
          this.showError('Ukuran foto yang diambil harus kurang dari 1MB');
          return;
        }
        
        this.#capturedBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        imagePreview.src = imageUrl;
        previewContainer.style.display = 'block';
        
        // Tutup modal kamera
        this.#closeCamera();
      }, 'image/jpeg', 0.9);
    });
    
    // Tombol tutup kamera
    closeCameraBtn.addEventListener('click', () => {
      this.#closeCamera();
    });
    
    // Cegah pengiriman form dari modal
    cameraModal.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Menutup kamera dan menghentikan semua track
   */
  #closeCamera() {
    const cameraModal = document.getElementById('cameraModal');
    
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach(track => track.stop());
      this.#mediaStream = null;
    }
    
    cameraModal.style.display = 'none';
  }

  /**
   * Mengatur pengiriman form
   */
  #setupFormSubmission() {
    const addStoryForm = document.getElementById('addStoryForm');
    
    addStoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Dapatkan dan validasi deskripsi
      const description = document.getElementById('description').value.trim();
      if (!description) {
        this.showError('Silakan masukkan deskripsi cerita');
        return;
      }
      
      // Dapatkan dan validasi foto
      const photoFile = document.getElementById('photoFile').files[0];
      if (!photoFile && !this.#capturedBlob) {
        this.showError('Silakan tambahkan foto ke cerita Anda');
        return;
      }

      // Validasi ukuran foto
      const fileData = photoFile || this.#capturedBlob;
      if (fileData.size > 1024 * 1024) { // 1MB dalam bytes
        this.showError('Ukuran foto harus kurang dari 1MB');
        return;
      }
      
      // Buat objek FormData
      const formData = new FormData();
      formData.append('description', description);
      
      // Tambahkan foto ke FormData
      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (this.#capturedBlob) {
        formData.append('photo', this.#capturedBlob, 'photo.jpg');
      }
      
      // Tambahkan lokasi jika disertakan
      const includeLocation = document.getElementById('includeLocation').checked;
      if (includeLocation) {
        const lat = document.getElementById('latitude').value;
        const lon = document.getElementById('longitude').value;
        if (lat && lon) {
          formData.append('lat', lat);
          formData.append('lon', lon);
        }
      }
      
      // Periksa apakah online
      if (navigator.onLine) {
        // Kirim form melalui presenter jika online
        await this.#presenter.submitForm(formData);
      } else {
        // Simpan ke IndexedDB jika offline
        try {
          // Generate ID unik untuk cerita offline
          const offlineId = `offline_${Date.now()}`;
          
          // Konversi file/blob ke base64 untuk penyimpanan
          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileData);
          });
          
          const offlineData = {
            id: offlineId,
            description: description,
            photoUrl: base64Data,
            createdAt: new Date().toISOString(),
            isOffline: true
          };

          // Tambahkan data lokasi jika disertakan
          if (includeLocation) {
            const lat = document.getElementById('latitude').value;
            const lon = document.getElementById('longitude').value;
            if (lat && lon) {
              offlineData.lat = lat;
              offlineData.lon = lon;
            }
          }

          console.log('Menyimpan cerita offline:', offlineData);
          await saveData(offlineData);
          this.showSuccess('Cerita disimpan secara offline. Akan dikirim saat online.');
          
          // Reset form
          addStoryForm.reset();
          document.getElementById('previewContainer').style.display = 'none';
          this.#capturedBlob = null;
        } catch (error) {
          console.error('Kesalahan saat menyimpan cerita offline:', error);
          this.showError('Gagal menyimpan cerita secara offline. Silakan coba lagi.');
        }
      }
    });
  }

  /**
   * Menampilkan atau menyembunyikan status loading
   * @param {boolean} isLoading - Apakah akan menampilkan atau menyembunyikan status loading
   */
  showLoading(isLoading) {
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Jika kita tidak berada di halaman tambah cerita, langsung kembali
    if (!submitButton) {
      return;
    }
    
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = 'Mengirim...';
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Cerita';
    }
  }

  /**
   * Menampilkan pesan error
   * @param {string} message - Pesan error yang akan ditampilkan
   */
  showError(message) {
    console.error('Error:', message);
    alert(message);
  }

  /**
   * Menampilkan pesan sukses
   * @param {string} message - Pesan sukses yang akan ditampilkan
   */
  showSuccess(message) {
    console.log('Sukses:', message);
    alert(message);
  }

  /**
   * Mengkonversi data base64 ke Blob
   * @param {string} base64 - URL data base64
   * @param {string} mimeType - Tipe MIME dari data
   * @returns {Blob} Objek Blob
   */
  #base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeType });
  }

  /**
   * Menyinkronkan cerita offline dengan server
   */
  async #syncOfflineStories() {
    try {
      const stories = await getAllData();
      console.log('Memeriksa cerita offline:', stories);
      
      // Filter hanya cerita offline
      const offlineStories = stories.filter(story => story.isOffline);
      
      if (offlineStories.length > 0) {
        console.log('Menemukan cerita offline untuk dikirim:', offlineStories);
        
        for (const story of offlineStories) {
          try {
            // Buat FormData untuk pengiriman
            const formData = new FormData();
            formData.append('description', story.description);
            
            // Konversi base64 ke Blob jika diperlukan
            if (story.photoUrl && story.photoUrl.startsWith('data:')) {
              const mime = story.photoUrl.match(/^data:(.*);base64,/)[1];
              const blob = this.#base64ToBlob(story.photoUrl, mime);
              formData.append('photo', blob, 'photo.jpg');
            }
            
            // Tambahkan lokasi jika tersedia
            if (story.lat && story.lon) {
              formData.append('lat', story.lat);
              formData.append('lon', story.lon);
            }
            
            console.log('Mengirim cerita offline:', story.id);
            await this.#presenter.submitForm(formData);
            
            // Hapus dari IndexedDB hanya setelah pengiriman berhasil
            console.log('Menghapus cerita dari IndexedDB:', story.id);
            await deleteData(story.id);
            console.log('Berhasil menghapus cerita dari IndexedDB:', story.id);
          } catch (error) {
            console.error('Kesalahan saat mengirim cerita offline:', story.id, error);
            // Jangan hapus cerita jika pengiriman gagal
            this.showError(`Gagal mengirim cerita. Akan dicoba lagi nanti.`);
          }
        }
        
        this.showSuccess('Cerita offline berhasil dikirim.');
      }
    } catch (error) {
      console.error('Kesalahan dalam syncOfflineStories:', error);
      this.showError('Gagal menyinkronkan cerita offline.');
    }
  }

  #setupOnlineSync() {
    window.addEventListener('online', async () => {
      console.log('Koneksi pulih, memeriksa cerita offline...');
      await this.#syncOfflineStories();
    });
  }
}