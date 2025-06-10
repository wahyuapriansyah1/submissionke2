import { convertBase64ToUint8Array } from './index';
import CONFIG from './config';
import API from '../api';

// Log API object untuk debugging
console.log('API object:', API);

/**
 * Memeriksa ketersediaan API Notifikasi
 * @returns {boolean} Status ketersediaan API Notifikasi
 */
export function isNotificationAvailable() {
    return 'Notification' in window;
}
   
/**
 * Memeriksa status izin notifikasi
 * @returns {boolean} Status izin notifikasi
 */
export function isNotificationGranted() {
    return Notification.permission === 'granted';
}
   
/**
 * Meminta izin notifikasi dari pengguna
 * @returns {Promise<boolean>} Status izin notifikasi
 */
export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
      console.error('API Notifikasi tidak didukung.');
      return false;
    }
   
    if (isNotificationGranted()) {
      return true;
    }
   
    const status = await Notification.requestPermission();
   
    if (status === 'denied') {
      alert('Izin notifikasi ditolak.');
      return false;
    }
   
    if (status === 'default') {
      alert('Izin notifikasi ditutup atau diabaikan.');
      return false;
    }
   
    return true;
}
   
/**
 * Mendapatkan langganan push saat ini
 * @returns {Promise<PushSubscription|null>} Langganan push
 */
export async function getPushSubscription() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            console.error('Service Worker tidak terdaftar');
            return null;
        }
        return await registration.pushManager.getSubscription();
    } catch (error) {
        console.error('Error mendapatkan langganan push:', error);
        return null;
    }
}
   
/**
 * Memeriksa ketersediaan langganan push
 * @returns {Promise<boolean>} Status ketersediaan langganan
 */
export async function isCurrentPushSubscriptionAvailable() {
    return !!(await getPushSubscription());
}

/**
 * Membuat opsi langganan push
 * @returns {Object} Opsi langganan
 */
export function generateSubscribeOptions() {
    if (!CONFIG.VAPID_PUBLIC_KEY) {
        console.error('VAPID_PUBLIC_KEY tidak ditemukan dalam konfigurasi');
        throw new Error('VAPID_PUBLIC_KEY tidak ditemukan');
    }
    return {
      userVisibleOnly: true,
      applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    };
}
   
/**
 * Melakukan langganan push notification
 */
export async function subscribe() {
    try {
        console.log('Memulai proses berlangganan...');
        
        if (!(await requestNotificationPermission())) {
            console.log('Izin notifikasi tidak diberikan');
            return;
        }
   
        if (await isCurrentPushSubscriptionAvailable()) {
            alert('Sudah berlangganan notifikasi push.');
            return;
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            throw new Error('Service Worker tidak terdaftar');
        }

        const options = generateSubscribeOptions();
        console.log('Mencoba berlangganan dengan opsi:', options);

        const langgananPush = await registration.pushManager.subscribe(options);
        if (!langgananPush) {
            throw new Error('Gagal membuat langganan push');
        }

        const { endpoint, keys } = langgananPush.toJSON();
        console.log('Data langganan:', { endpoint, keys });
        
        console.log('Mengirim data langganan ke server...');
        console.log('API object:', API);
        console.log('API.notifications:', API.notifications);
        
        if (!API.notifications || typeof API.notifications.subscribe !== 'function') {
            console.error('API.notifications.subscribe tidak tersedia:', API);
            throw new Error('API notifikasi tidak tersedia');
        }
        
        const response = await API.notifications.subscribe({ endpoint, keys });
        console.log('Response dari server:', response);

        if (response.error) {
            console.error('Error dari server:', response);
            await langgananPush.unsubscribe();
            alert('Gagal mengaktifkan langganan notifikasi push.');
            return;
        }

        alert('Berhasil mengaktifkan langganan notifikasi push.');
    } catch (error) {
        console.error('Error dalam proses berlangganan:', error);
        alert('Terjadi kesalahan saat mengaktifkan notifikasi push. Silakan coba lagi nanti.');
    }
}

/**
 * Membatalkan langganan push notification
 */
export async function unsubscribe() {
    const pesanGagal = 'Gagal menonaktifkan langganan notifikasi push.';
    const pesanBerhasil = 'Berhasil menonaktifkan langganan notifikasi push.';
    try {
      const langgananPush = await getPushSubscription();
      if (!langgananPush) {
        alert('Tidak dapat membatalkan langganan karena belum berlangganan sebelumnya.');
        return;
      }
      const { endpoint, keys } = langgananPush.toJSON();
      const response = await API.notifications.unsubscribe({ endpoint });
      if (response.error) {
        alert(pesanGagal);
        console.error('unsubscribe: response:', response);
        return;
      }
      const berhasilDibatalkan = await langgananPush.unsubscribe();
      if (!berhasilDibatalkan) {
        alert(pesanGagal);
        await API.notifications.subscribe({ endpoint, keys });
        return;
      }
      alert(pesanBerhasil);
    } catch (error) {
      alert(pesanGagal);
      console.error('unsubscribe: error:', error);
    }
}