import { saveData, getAllData, getDataById, deleteData, saveImage, getImage } from './utils/idb';

/**
 * Konfigurasi API
 */
const API_CONFIG = {
  baseUrl: 'https://story-api.dicoding.dev/v1',
  vapidKey: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
  endpoints: {
    auth: {
      login: '/login',
      register: '/register'
    },
    stories: {
      list: '/stories',
      detail: (id) => `/stories/${id}`
    },
    notifications: {
      subscribe: '/notifications/subscribe',
      unsubscribe: '/notifications/subscribe'
    }
  }
};

/**
 * Utility functions untuk API
 */
const ApiUtils = {
  /**
   * Mengambil token dari localStorage
   */
  getToken() {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return userData.accessToken || null;
    } catch {
      return null;
    }
  },

  /**
   * Membuat URL lengkap untuk endpoint
   */
  createUrl(endpoint) {
    return `${API_CONFIG.baseUrl}${endpoint}`;
  },

  /**
   * Menangani response dari API
   */
  async handleResponse(response) {
    const data = await response.json();
    if (data.error) {
      throw new Error(data.message);
    }
    return data;
  }
};

/**
 * Service untuk autentikasi
 */
const AuthService = {
  async login(credentials) {
    const response = await fetch(ApiUtils.createUrl(API_CONFIG.endpoints.auth.login), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return ApiUtils.handleResponse(response);
  },

  async register(userData) {
    const response = await fetch(ApiUtils.createUrl(API_CONFIG.endpoints.auth.register), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return ApiUtils.handleResponse(response);
  }
};

/**
 * Service untuk manajemen gambar
 */
const ImageService = {
  async cacheImage(url) {
    try {
      const existingImage = await getImage(url);
      if (existingImage) return existingImage;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal mengambil gambar');

      const blob = await response.blob();
      await saveImage(url, blob);
      return blob;
    } catch (error) {
      console.error('Error caching image:', error);
      return null;
    }
  },

  async getImageUrl(url) {
    try {
      const cachedImage = await getImage(url);
      if (cachedImage) return URL.createObjectURL(cachedImage);

      const newImage = await this.cacheImage(url);
      return newImage ? URL.createObjectURL(newImage) : url;
    } catch {
      return url;
    }
  }
};

/**
 * Service untuk manajemen cerita
 */
const StoryService = {
  async getList(page = 1, size = 10) {
    try {
      const token = ApiUtils.getToken();
      const response = await fetch(
        ApiUtils.createUrl(`${API_CONFIG.endpoints.stories.list}?page=${page}&size=${size}`),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await ApiUtils.handleResponse(response);

      // Cache stories
      for (const story of data.listStory) {
        await saveData(story, 'stories');
        if (story.photoUrl) {
          await ImageService.cacheImage(story.photoUrl);
        }
      }

      return data;
    } catch (error) {
      if (!navigator.onLine) {
        const cachedStories = await getAllData('stories');
        return {
          error: false,
          message: 'Success',
          listStory: cachedStories
        };
      }
      throw error;
    }
  },

  async getDetail(id) {
    try {
      const token = ApiUtils.getToken();
      const response = await fetch(
        ApiUtils.createUrl(API_CONFIG.endpoints.stories.detail(id)),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await ApiUtils.handleResponse(response);

      if (data.story) {
        await saveData(data.story);
        if (data.story.photoUrl) {
          await ImageService.cacheImage(data.story.photoUrl);
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching story:', error);
      const cachedStory = await getDataById(id);
      return cachedStory ? {
        error: false,
        message: 'Success',
        story: cachedStory
      } : {
        error: true,
        message: 'Story not found'
      };
    }
  },

  async create(formData) {
    try {
      const token = ApiUtils.getToken();
      const response = await fetch(
        ApiUtils.createUrl(API_CONFIG.endpoints.stories.list),
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.story) {
        await saveData(data.story);
      }

      return data;
    } catch (error) {
      console.error('Error creating story:', error);
      return {
        error: true,
        message: error.message || 'Failed to create story'
      };
    }
  }
};

/**
 * Service untuk notifikasi
 */
const NotificationService = {
  async subscribe(subscription) {
    const token = ApiUtils.getToken();
    if (!token) {
      return {
        error: true,
        message: 'Authentication required'
      };
    }

    try {
      const response = await fetch(
        ApiUtils.createUrl(API_CONFIG.endpoints.notifications.subscribe),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(subscription)
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error subscribing:', error);
      return {
        error: true,
        message: 'Failed to subscribe'
      };
    }
  },

  async unsubscribe(subscription) {
    const token = ApiUtils.getToken();
    if (!token) {
      return {
        error: true,
        message: 'Authentication required'
      };
    }

    try {
      const response = await fetch(
        ApiUtils.createUrl(API_CONFIG.endpoints.notifications.unsubscribe),
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(subscription)
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return {
        error: true,
        message: 'Failed to unsubscribe'
      };
    }
  }
};

/**
 * API utama yang mengekspor semua service
 */
const Api = {
  auth: AuthService,
  stories: StoryService,
  images: ImageService,
  notifications: NotificationService,
  config: API_CONFIG
};

export default Api;