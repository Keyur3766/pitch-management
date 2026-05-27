import axios from "axios";
import { Pitch, APISuccessResponseInterface } from '../interface/api';
const api_base_url = import.meta.env.VITE_API_URL;;

const apiClient = axios.create({
  baseURL: api_base_url,
  // withCredentials: true,
  timeout: 120000,
});

apiClient.interceptors.request.use(
  function (config) {

    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default {
  GenerateLoginToken: async function (
    name: string,
    password: string
  ): Promise<any> {
    try {
      return await apiClient.post("/api/login/generateToken", {
        name: name,
        password: password,
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  logoutUser: async function () {
    const response = await axios.post(`${api_base_url}/api/login/removeToken`);

    return response;
  },

  registerUser: async function (
    email: string,
    name: string,
    password: string
  ): Promise<any> {
    try {
      return await apiClient.post("/api/login/registeruser", {
        email: email,
        name: name,
        password: password,
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  getPitches: async function (): Promise<any> {
    try {
      return await apiClient.get("/api/booking/pitches");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  getSlotByPitchId: async function (pitchId: number, date: Date) {
    try {
      return await apiClient.get(
        `/api/booking/slots?pitchId=${pitchId}&date=${date}`
      );
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  getBookings: async function () {
    try {
      return await apiClient.get(`/api/booking/my-bookings`);
    } catch (error) {
      console.log(error);
      return error;
    }
  },

    reserveBooking: async function (requestparams: any): Promise<any> {
    try {
      return await apiClient.post("/api/booking/reserve-slot", requestparams);
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  confirmBooking: async function (
    bookingId: number
  ): Promise<any> {
    try {
      return await apiClient.post("/api/booking/confirm-booking", {
        bookingId: bookingId,
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};