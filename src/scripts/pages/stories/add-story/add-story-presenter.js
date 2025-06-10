/**
 * Kelas presenter untuk halaman tambah cerita
 * Menangani komunikasi antara model dan view
 */
export default class AddStoryPresenter {
  #model;
  #view;

  /**
   * Konstruktor untuk AddStoryPresenter
   * @param {Object} param0 - Objek yang berisi model dan view
   * @param {Object} param0.model - Model tambah cerita
   * @param {Object} param0.view - View tambah cerita
   */
  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    
    // Hubungkan view ke presenter
    this.#view.setPresenter(this);
  }

  /**
   * Menginisialisasi presenter
   * Memeriksa apakah pengguna sudah terautentikasi
   */
  init() {
    if (!this.#model.isAuthenticated()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }

  /**
   * Menangani pengiriman form
   * @param {FormData} formData - Data form yang berisi detail cerita
   */
  async submitForm(formData) {
    console.log('Mengirim form dengan data:', {
      description: formData.get('description'),
      hasPhoto: formData.has('photo'),
      hasLocation: formData.has('lat') && formData.has('lon')
    });

    try {
      // Tambahkan cerita melalui model
      const result = await this.#model.addStory(formData);
      
      // Tangani hasil
      if (result.success) {
        this.#view.showSuccess('Cerita berhasil ditambahkan');
        // Hanya redirect jika kita berada di halaman tambah cerita
        if (window.location.hash === '#/add-story') {
          window.location.hash = '#/stories';
        }
      } else {
        this.#view.showError(result.message);
      }
    } catch (error) {
      console.error('Kesalahan saat mengirim cerita:', error);
      this.#view.showError('Terjadi kesalahan saat menambahkan cerita');
    }
  }

  /**
   * Mendapatkan lokasi pengguna saat ini
   * @returns {Promise<Object>} Koordinat lokasi atau null jika tidak dapat mendapatkan lokasi
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolokasi tidak didukung oleh browser Anda'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
} 