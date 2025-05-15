import bookingService from '../services/bookingService';

const bookingController = {
  // Calculate total price for hotel booking
  calculateHotelPrice: (pricePerNight, startDate, endDate, numberOfRooms) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return pricePerNight * numberOfNights * numberOfRooms;
  },

  // Prepare hotel booking data
  prepareHotelBookingData: (hotel, formData) => {
    const totalPrice = bookingController.calculateHotelPrice(
      hotel.price_per_night,
      formData.startDate,
      formData.endDate,
      parseInt(formData.numberOfRooms)
    );

    return {
      hotel: hotel._id,
      roomType: formData.roomType,
      numberOfRooms: parseInt(formData.numberOfRooms),
      name: formData.name,
      email: formData.email,
      numberOfPeople: parseInt(formData.numberOfPeople),
      startDate: formData.startDate,
      endDate: formData.endDate,
      departureCity: formData.departureCity || "N/A",
      total_price: totalPrice,
      hotelMeta: {
        hotel_name: hotel.hotel_name,
        location: hotel.location,
        image: hotel.images?.[0] || "/default.jpg",
        price_per_night: hotel.price_per_night
      },
      hotel_room_details: {
        roomType: formData.roomType,
        numberOfRooms: parseInt(formData.numberOfRooms)
      }
    };
  },

  // Create hotel booking
  createHotelBooking: async (hotel, formData, token) => {
    try {
      const bookingData = bookingController.prepareHotelBookingData(hotel, formData);
      return await bookingService.createHotelBooking(bookingData, token);
    } catch (error) {
      throw error;
    }
  },

  // Get user bookings
  getUserBookings: async (token) => {
    try {
      const bookings = await bookingService.getUserBookings(token);
      return bookings.filter(booking => booking.status !== "Cancelled");
    } catch (error) {
      throw error;
    }
  },

  // Delete booking
  deleteBooking: async (bookingId, token) => {
    try {
      return await bookingService.deleteBooking(bookingId, token);
    } catch (error) {
      throw error;
    }
  }
};

export default bookingController; 