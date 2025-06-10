// Import halaman-halaman aplikasi
import HomeView from '../pages/home/home-view';
import LoginView from '../pages/auth/login/login-view';
import RegisterView from '../pages/auth/register/register-view';
import StoriesView from '../pages/stories/story/stories-view';
import DetailStoryView from '../pages/stories/detail-story/detail-story-view';
import AddStoryView from '../pages/stories/add-story/add-story-view';
import NotFoundView from '../pages/not-found/not-found-view';

/**
 * Konfigurasi rute aplikasi
 * Menentukan halaman yang akan ditampilkan berdasarkan URL
 */
const routeConfig = {
  '/': new HomeView(),                    // Halaman Utama
  '/login': new LoginView(),              // Halaman Login
  '/register': new RegisterView(),        // Halaman Register
  '/stories': new StoriesView(),          // Halaman Daftar Cerita
  '/stories/:id': new DetailStoryView(),  // Halaman Detail Cerita
  '/add-story': new AddStoryView()        // Halaman Tambah Cerita (User)
};

/**
 * Mendapatkan halaman berdasarkan rute
 * @param {string} route - Rute yang diminta
 * @returns {Object} Instance view yang sesuai
 */
const getPage = (route) => routeConfig[route] || new NotFoundView();

export { getPage };
export default routeConfig;
