import Auth from './utils/auth';
import 'leaflet';

const app = {
  async init() {
    Auth.updateNavigation();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        Auth.updateNavigation();
      });
    }
  }
};

export default app; 