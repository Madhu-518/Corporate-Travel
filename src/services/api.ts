import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('❌ VITE_API_BASE_URL is not defined in the environment variables');
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Employee {
  id: number;
  name: string;
  userId: number;
}

interface Expense {
  id: number;
  employeeId: number;
  amount: number;
  description: string;
  status: string;
}

interface Booking {
  id: number;
  employeeId: number;
  hotelId?: number;
  flightId?: number;
  pickupId?: number;
  date: string;
}

interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
}

interface Pickup {
  id: number;
  employeeId: number;
  pickupLocation: string;
  pickupTime: string;
}

interface ApiData {
  users: User[];
  employees: Employee[];
  expenses: Expense[];
  bookings: Booking[];
  flights: Flight[];
  hotels: Hotel[];
  pickups: Pickup[];
}

// Cache the API data to avoid multiple requests
let cachedData: ApiData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchApiData = async (): Promise<ApiData> => {
  const now = Date.now();

  // Return cached data if valid
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const response = await axios.get<ApiData>(API_BASE_URL);
    cachedData = response.data;
    lastFetchTime = now;
    return cachedData;
  } catch (error) {
    console.error('❌ Failed to fetch API data:', error);
    throw new Error('Unable to load API data');
  }
};

export const apiService = {
  // Users
  getUsers: async (): Promise<User[]> => {
    const data = await fetchApiData();
    return data.users;
  },

  getUserByEmail: async (email: string): Promise<User[]> => {
    const data = await fetchApiData();
    return data.users.filter(user => user.email === email);
  },

  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    const data = await fetchApiData();
    return data.employees;
  },

  // Expenses
  getExpenses: async (employeeId?: number): Promise<Expense[]> => {
    const data = await fetchApiData();
    return employeeId
      ? data.expenses.filter(expense => expense.employeeId === employeeId)
      : data.expenses;
  },

  // Bookings
  getBookings: async (employeeId?: number): Promise<Booking[]> => {
    const data = await fetchApiData();
    return employeeId
      ? data.bookings.filter(booking => booking.employeeId === employeeId)
      : data.bookings;
  },

  // Flights
  getFlights: async (): Promise<Flight[]> => {
    const data = await fetchApiData();
    return data.flights;
  },

  // Hotels
  getHotels: async (): Promise<Hotel[]> => {
    const data = await fetchApiData();
    return data.hotels;
  },

  // Pickups
  getPickups: async (): Promise<Pickup[]> => {
    const data = await fetchApiData();
    return data.pickups;
  },

  // Clear cache manually
  clearCache: (): void => {
    cachedData = null;
    lastFetchTime = 0;
  }
};
