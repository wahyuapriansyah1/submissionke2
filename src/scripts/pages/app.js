import routes, { getPage } from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { generateUnsubscribeButton, generateSubscribeButton } from '../utils/template';
import { isServiceWorkerAvailable } from '../utils';
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper';
import { getPushSubscription } from '../utils/notification-helper';
import API from '../api';

/**
 * Kelas Aplikasi
 * Menangani inisialisasi dan manajemen aplikasi utama
 */
class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  /**
   * Konstruktor kelas Aplikasi
   * @param {Object} options - Opsi untuk inisialisasi aplikasi
   * @param {HTMLElement} options.navigationDrawer - Elemen drawer navigasi
   * @param {HTMLElement} options.drawerButton - Tombol untuk membuka/menutup drawer
   * @param {HTMLElement} options.content - Elemen konten utama
   */
  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  /**
   * Menyiapkan drawer navigasi dan event listener-nya
   * Menangani interaksi pengguna dengan drawer
   */
  #setupDrawer() {
    // Event listener untuk tombol drawer
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
      // Memperbarui atribut aria-expanded
      const isExpanded = this.#navigationDrawer.classList.contains('open');
      this.#drawerButton.setAttribute('aria-expanded', isExpanded);
    });

    // Event listener untuk menutup drawer saat klik di luar
    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      // Menutup drawer saat link diklik
      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /**
   * Menyiapkan notifikasi push
   * Menangani langganan dan pembatalan langganan notifikasi
   */
  async #setupPushNotification() {
    const navList = document.getElementById('nav-list');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    
    // Hapus tombol notifikasi yang ada jika ada
    const existingButtons = navList.querySelectorAll('.push-notification-item');
    existingButtons.forEach(button => button.remove());
    
    if (isSubscribed) {
      const unsubscribeButton = generateUnsubscribeButton();
      navList.insertAdjacentHTML('beforeend', unsubscribeButton);
      document.getElementById('unsubscribe-button').addEventListener('click', async () => {
        console.log('Berhenti berlangganan');
        await unsubscribe();
        this.#setupPushNotification();
      });
      return;
    }

    const subscribeButton = generateSubscribeButton();
    navList.insertAdjacentHTML('beforeend', subscribeButton);
    
    document.getElementById('subscribe-button').addEventListener('click', async () => {
      console.log('Berlangganan');
      await subscribe();
      this.#setupPushNotification();
    });
  }

  /**
   * Merender halaman berdasarkan rute yang aktif
   * Menangani animasi transisi antar halaman
   */
  async renderPage() {
    const url = getActiveRoute();
    const page = getPage(url);

    // Gunakan View Transition API jika tersedia
    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      }).finished;
    } else {
      // Animasi manual jika browser tidak mendukung
      const animation = this.#content.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(20px)' }
      ], {
        duration: 200,
        easing: 'ease-out'
      });
      await animation.finished;
      this.#content.innerHTML = await page.render();
      const newContent = this.#content.firstElementChild;
      if (newContent) {
        const enterAnimation = newContent.animate([
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 300,
          easing: 'ease-out'
        });
        await enterAnimation.finished;
      }
      await page.afterRender();
    }
    
    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
  }
}

export default App;
