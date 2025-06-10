import Api from '../../../api';
import Auth from '../../../utils/auth';

/**
 * Model class for the stories page
 * Handles data operations and business logic for stories
 */
export default class StoriesModel {
  constructor() {
    this.page = 1;
    this.size = 10;
    this.stories = [];
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
    return JSON.parse(localStorage.getItem('user'));
  }

  /**
   * Resets pagination to first page
   */
  resetPagination() {
    this.page = 1;
    this.stories = [];
  }

  /**
   * Increment page number for pagination
   */
  nextPage() {
    this.page += 1;
  }

  /**
   * Loads stories from the API
   * @returns {Promise<Object>} Response data with stories
   */
  async loadStories() {
    const user = this.getUserData();
    console.log(user)
    if (!user || !user.accessToken) {
  
      throw new Error('User not authenticated');
    }

    try {
      const responseData = await Api.stories.getList(this.page, this.size);

      if (responseData.error === false) {
        this.stories = [...this.stories, ...responseData.listStory];
        return {
          success: true,
          stories: this.stories,
          newStories: responseData.listStory
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to load stories'
        };
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      throw error;
    }
  }

  /**
   * Gets all currently loaded stories
   * @returns {Array} Array of story objects
   */
  getStories() {
    return this.stories;
  }

  /**
   * Filters stories located in Indonesia
   * @returns {Array} Array of story objects in Indonesia
   */
  getStoriesInIndonesia() {
    return this.stories.filter(story => {
      const lat = parseFloat(story.lat);
      const lon = parseFloat(story.lon);
      return !isNaN(lat) && !isNaN(lon) && 
             lat >= -11 && lat <= 6 && 
             lon >= 95 && lon <= 141;
    });
  }
} 