/**
 * Membuat tombol untuk berlangganan notifikasi
 * @returns {string} HTML untuk tombol berlangganan
 */
export function generateSubscribeButton() {
  return `
    <li class="push-notification-item">
      <button id="subscribe-button" class="push-notification-button" aria-label="Berlangganan notifikasi push">
        <i class="bi bi-bell"></i>
      </button>
    </li>
  `;
}

/**
 * Membuat tombol untuk membatalkan langganan notifikasi
 * @returns {string} HTML untuk tombol pembatalan langganan
 */
export function generateUnsubscribeButton() {
  return `
    <li class="push-notification-item">
      <button id="unsubscribe-button" class="push-notification-button" aria-label="Batalkan langganan notifikasi push">
        <i class="bi bi-bell-slash"></i>
      </button>
    </li>
  `;
}