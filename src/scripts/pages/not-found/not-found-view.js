import '../../../styles/pages/not-found.css';

/**
 * Class NotFoundView
 * Handles rendering and UI interactions for the 404 page
 */
export default class NotFoundView {
  /**
   * Renders the 404 page content
   * @returns {string} HTML string for the 404 page
   */
  async render() {
    return `
      <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
        <div class="max-w-4xl w-full">
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div class="p-8 md:p-12">
              <div class="text-center space-y-8">
                <!-- 404 Illustration -->
                <div class="relative">
                  <div class="w-48 h-48 mx-auto mb-8">
                    <div class="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                    <div class="relative flex items-center justify-center h-full">
                      <span class="text-8xl font-bold text-green-600">404</span>
                    </div>
                  </div>
                  <div class="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                  <div class="absolute -bottom-8 left-20 w-24 h-24 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                </div>

                <!-- Error Message -->
                <div class="space-y-4">
                  <h1 class="text-4xl md:text-5xl font-bold text-gray-800">
                    Halaman Tidak Ditemukan
                  </h1>
                  <p class="text-lg text-gray-600 max-w-md mx-auto">
                    Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <a href="#/" 
                    class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center">
                    <i class="bi bi-house-door mr-2"></i>
                    Kembali ke Beranda
                  </a>
                  <button onclick="window.history.back()" 
                    class="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center">
                    <i class="bi bi-arrow-left mr-2"></i>
                    Kembali
                  </button>
                </div>

                <!-- Decorative Elements -->
                <div class="relative mt-12">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200"></div>
                  </div>
                  <div class="relative flex justify-center">
                    <span class="px-4 bg-white text-sm text-gray-500">
                      <i class="bi bi-map-fill text-green-600 mr-2"></i>
                      Cerita Peta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Lifecycle method called after the page is rendered
   */
  async afterRender() {
    // Add custom styles for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
    `;
    document.head.appendChild(style);
  }
} 