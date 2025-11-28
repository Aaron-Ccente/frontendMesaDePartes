// frontend-mesa-de-partes/src/services/adminViewerService.js
import { fetchWithAuth } from './api';

const adminViewerService = {
  /**
   * Fetches the list of cases for the admin viewer.
   * @returns {Promise<any>}
   */
  getAllCases: async () => {
    const response = await fetchWithAuth('/api/admin-viewer/casos'); 
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error fetching cases for viewer' }));
      throw new Error(errorData.message);
    }
    return response.json();
  },

  /**
   * Fetches the complete details for a single case.
   * @param {string|number} id The ID of the case.
   * @returns {Promise<any>}
   */
  getCaseById: async (id) => {
    const response = await fetchWithAuth(`/api/admin-viewer/casos/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error fetching case details' }));
      throw new Error(errorData.message);
    }
    return response.json();
  }
};

export default adminViewerService;
