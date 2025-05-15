import axios from '../axiosConfig';

const bookingService = {
  // Create a new hotel booking
  createHotelBooking: async (bookingData, token) => {
    try {
      const response = await axios.post('/bookings', bookingData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async (token) => {
    try {
      const response = await axios.get('/bookings/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a booking
  deleteBooking: async (bookingId, token) => {
    try {
      const response = await axios.delete(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default bookingService; 