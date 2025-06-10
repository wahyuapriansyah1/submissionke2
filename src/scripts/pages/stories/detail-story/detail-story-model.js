import Api from '../../../api';
import Auth from '../../../utils/auth';

/**
 * Model class for the detail story page
 * Handles data operations and business logic for story details
 */
export default class DetailStoryModel {
  #story;

  constructor() {
    this.#story = null;
  }

  /**
   * Checks if the user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return Auth.checkAuth();
  }

  /**
   * Gets the current user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getUserData() {
    return Auth.getUserData();
  }

  /**
   * Gets the current story data
   * @returns {Object|null} Story data or null if not loaded
   */
  getStory() {
    return this.#story;
  }

  /**
   * Loads story details from the API
   * @param {string} storyId - ID of the story to load
   * @returns {Promise<Object>} Response data with story details
   */
  async loadStoryDetail(storyId) {
    const user = this.getUserData();
    if (!user || !user.accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      const responseData = await Api.stories.getDetail(storyId);

      if (responseData.error === false) {
        this.#story = responseData.story;
        return {
          success: true,
          data: this.#story
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to load story details'
        };
      }
    } catch (error) {
      console.error('Error loading story details:', error);
      throw new Error('Failed to load story details. Please try again later.');
    }
  }

  /**
   * Checks if the story has location data
   * @returns {boolean} True if story has location data
   */
  hasLocation() {
    return !!(this.#story && this.#story.lat && this.#story.lon);
  }

  /**
   * Gets the coordinates of the story
   * @returns {Object|null} Object with lat and lon properties, or null if no location
   */
  getCoordinates() {
    if (!this.hasLocation()) return null;
    
    return {
      lat: parseFloat(this.#story.lat),
      lon: parseFloat(this.#story.lon)
    };
  }
} 