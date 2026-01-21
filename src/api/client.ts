import axios, { AxiosError } from 'axios';

import { config } from '../../config';

/**
 * Error response structure from backend
 */
export interface AppErrorResponse {
  message?: string;
  code?: string;
  statusCode?: number;
  error?: string;
}

/**
 * Axios instance configured for backend communication
 */
export const api = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor to handle errors
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<AppErrorResponse>) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: error.message || 'Network error. Please check your connection.',
      });
    }

    // Handle HTTP errors
    const status = error.response.status;
    const errorData = error.response.data;

    switch (status) {
      case 400:
        return Promise.reject({
          ...error,
          message: errorData?.message || 'Invalid request',
        });
      case 401:
        return Promise.reject({
          ...error,
          message: errorData?.message || 'Authentication required',
        });
      case 403:
        return Promise.reject({
          ...error,
          message: errorData?.message || 'Access forbidden',
        });
      case 404:
        return Promise.reject({
          ...error,
          message: errorData?.message || 'Resource not found',
        });
      case 500:
      case 502:
      case 503:
        return Promise.reject({
          ...error,
          message: errorData?.message || 'Server error. Please try again later.',
        });
      default:
        return Promise.reject({
          ...error,
          message: errorData?.message || error.message || 'An error occurred',
        });
    }
  }
);