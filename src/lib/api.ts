/**
 * Reusable API service for communicating with the Django backend.
 *
 * Automatically retrieves the current Firebase ID token and sends it
 * as a Bearer token in the Authorization header on every request.
 *
 * Usage:
 *   import { apiGet, apiPost } from './api';
 *
 *   // Public endpoint (no auth needed)
 *   const health = await apiGet('/api/health/');
 *
 *   // Protected endpoint (auto-attaches Firebase token)
 *   const me = await apiGet('/api/me/');
 *
 *   // POST with body
 *   const result = await apiPost('/api/orders/', { title: 'My Order' });
 */

import { auth, isFirebaseConfigured } from './firebase';

// Base URL for the Django backend API
// Defaults to localhost:8000 for development
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


/**
 * Get the current Firebase ID token for the authenticated user.
 * Returns null if no user is signed in or Firebase is not configured.
 */
async function getFirebaseToken(): Promise<string | null> {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  try {
    // Force refresh ensures the token is always valid
    const token = await currentUser.getIdToken(/* forceRefresh */ false);
    return token;
  } catch (error) {
    console.error('[API] Failed to get Firebase ID token:', error);
    return null;
  }
}

/**
 * Build request headers, including the Authorization header if a
 * Firebase user is signed in.
 */
async function buildHeaders(
  extraHeaders?: Record<string, string>
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  const token = await getFirebaseToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Standardized API error class with status code and response body.
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Process the response from a fetch call.
 * Throws ApiError for non-2xx responses.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  let data: any;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail || data?.message || `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

/**
 * Make an authenticated GET request to the Django backend.
 *
 * @param path - API path (e.g., '/api/health/')
 * @param extraHeaders - Optional additional headers
 * @returns Parsed JSON response
 */
export async function apiGet<T = any>(
  path: string,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = await buildHeaders(extraHeaders);

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  return handleResponse<T>(response);
}

/**
 * Make an authenticated POST request to the Django backend.
 *
 * @param path - API path (e.g., '/api/orders/')
 * @param body - Request body (will be JSON-serialized)
 * @param extraHeaders - Optional additional headers
 * @returns Parsed JSON response
 */
export async function apiPost<T = any>(
  path: string,
  body?: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = await buildHeaders(extraHeaders);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * Make an authenticated PUT request to the Django backend.
 *
 * @param path - API path
 * @param body - Request body (will be JSON-serialized)
 * @param extraHeaders - Optional additional headers
 * @returns Parsed JSON response
 */
export async function apiPut<T = any>(
  path: string,
  body?: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = await buildHeaders(extraHeaders);

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * Make an authenticated DELETE request to the Django backend.
 *
 * @param path - API path
 * @param extraHeaders - Optional additional headers
 * @returns Parsed JSON response
 */
export async function apiDelete<T = any>(
  path: string,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = await buildHeaders(extraHeaders);

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  return handleResponse<T>(response);
}

/**
 * Make an authenticated POST request with FormData (for file uploads).
 * Does not set Content-Type so the browser sets it with the boundary.
 */
export async function apiUpload<T = any>(
  path: string,
  formData: FormData,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  // Custom header builder without Content-Type
  const headers: Record<string, string> = { ...extraHeaders };
  const token = await getFirebaseToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<T>(response);
}

