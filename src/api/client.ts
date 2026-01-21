import axios, { AxiosError } from 'axios';

import { config } from '../../config';

/**
 * Error response structure from backend (NestJS HttpException format)
 */
export interface AppErrorResponse {
  message?: string | string[];
  code?: string;
  statusCode?: number;
  error?: string;
  provider?: string;
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

    // Extract message from NestJS HttpException format
    const extractMessage = (data: AppErrorResponse | undefined): string => {
      if (!data?.message) {
        return '';
      }
      
      // Handle array of messages (validation errors)
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      
      // Handle string message
      return data.message;
    };

    const errorMessage = extractMessage(errorData) || error.message || 'An error occurred';

    switch (status) {
      case 400:
        return Promise.reject({
          ...error,
          message: errorMessage || 'Invalid request',
        });
      case 401:
        return Promise.reject({
          ...error,
          message: errorMessage || 'Authentication required',
        });
      case 403:
        return Promise.reject({
          ...error,
          message: errorMessage || 'Access forbidden',
        });
      case 404:
        return Promise.reject({
          ...error,
          message: errorMessage || 'Resource not found',
        });
      case 429:
        return Promise.reject({
          ...error,
          message: errorMessage || 'Too many requests. Please try again later.',
        });
      case 500:
      case 502:
      case 503:
        return Promise.reject({
          ...error,
          message: errorMessage || 'Server error. Please try again later.',
        });
      default:
        return Promise.reject({
          ...error,
          message: errorMessage,
        });
    }
  }
);