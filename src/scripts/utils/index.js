export const showFormattedDate = (date, locale = 'en-US', options = {}) => 
  new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });

export const sleep = (time = 1000) => 
  new Promise(resolve => setTimeout(resolve, time));

export const convertBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  return new Uint8Array(
    atob(base64)
      .split('')
      .map(char => char.charCodeAt(0))
  );
};

export const isServiceWorkerAvailable = () => 
  'serviceWorker' in navigator;

export const registerServiceWorker = async () => {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Service worker telah terpasang dengan cache-first strategy', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
};