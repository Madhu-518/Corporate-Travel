import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface Booking {
  id: number;
  employeeId: number;
  type: 'flight' | 'hotel' | 'pickup';
  from?: string;
  to?: string;
  city?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  amount: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  bookingDetails: any;
}

interface Flight {
  id: number;
  from: string;
  to: string;
  date: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  available: boolean;
}

interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  rating: number;
  pricePerNight: number;
  available: boolean;
  amenities: string[];
}

interface Pickup {
  id: number;
  city: string;
  pickupLocation: string;
  dropLocation: string;
  vehicleType: string;
  price: number;
  available: boolean;
}

interface BookingState {
  bookings: Booking[];
  flights: Flight[];
  hotels: Hotel[];
  pickups: Pickup[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  flights: [],
  hotels: [],
  pickups: [],
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (employeeId: number) => {
    const bookings = await apiService.getBookings(employeeId);
    return bookings;
  }
);

export const fetchFlights = createAsyncThunk(
  'booking/fetchFlights',
  async () => {
    const flights = await apiService.getFlights();
    return flights;
  }
);

export const fetchHotels = createAsyncThunk(
  'booking/fetchHotels',
  async () => {
    const hotels = await apiService.getHotels();
    return hotels;
  }
);

export const fetchPickups = createAsyncThunk(
  'booking/fetchPickups',
  async () => {
    const pickups = await apiService.getPickups();
    return pickups;
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: Omit<Booking, 'id'>) => {
    // Since external API is read-only, we'll create a mock booking with a new ID
    const mockBooking: Booking = {
      ...bookingData,
      id: Date.now(), // Generate a temporary ID
      status: 'confirmed' as const
    };
    return mockBooking;
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      .addCase(fetchFlights.fulfilled, (state, action) => {
        state.flights = action.payload;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.hotels = action.payload;
      })
      .addCase(fetchPickups.fulfilled, (state, action) => {
        state.pickups = action.payload;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.push(action.payload);
      });
  },
});

export const { clearError } = bookingSlice.actions;
export default bookingSlice.reducer; 