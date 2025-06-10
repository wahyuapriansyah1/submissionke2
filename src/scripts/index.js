import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import { registerServiceWorker } from './utils';
import Auth from './utils/auth';

document.addEventListener('DOMContentLoaded', async () => {
  Auth.updateNavigation();
  
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      Auth.updateNavigation();
    });
  }

  await app.renderPage();

  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    mainContent.style.opacity = 0;
    mainContent.style.transition = 'opacity 0.4s ease-out';
    setTimeout(() => {
      mainContent.style.opacity = 1;
    }, 10);
  }

  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
