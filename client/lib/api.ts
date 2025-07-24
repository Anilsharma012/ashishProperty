// Environment Detection
const detectEnvironment = () => {
  if (typeof window === "undefined") return "server";

  const { protocol, hostname, port } = window.location;

  // Development environment
  if (hostname === "localhost" || hostname === "127.0.0.1" || port === "8080") {
    return "development";
  }

  // Fly.dev deployment
  if (hostname.includes(".fly.dev")) {
    return "fly";
  }

  // Netlify deployment
  if (hostname.includes(".netlify.app")) {
    return "netlify";
  }

  // Other production
  return "production";
};

// API Configuration
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log(
      "🔧 Using configured VITE_API_BASE_URL:",
      import.meta.env.VITE_API_BASE_URL,
    );
    return import.meta.env.VITE_API_BASE_URL;
  }

  const environment = detectEnvironment();
  console.log("🎯 Detected environment:", environment);

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    console.log("📍 Current location:", {
      protocol,
      hostname,
      port,
      href: window.location.href,
    });

    switch (environment) {
      case "development":
        // Development: Vite proxy handles API requests
        return "";

      case "fly":
        // Fly.dev: Backend and frontend on same domain, same port
        return `${protocol}//${hostname}`;

      case "netlify":
        // Netlify: Use Netlify Functions
        return "";

      case "production":
      default:
        // Other production: Try same domain first, fallback to common ports
        if (port && port !== "80" && port !== "443") {
          return `${protocol}//${hostname}`;
        }
        return "";
    }
  }

  return "";
};

const API_BASE_URL = getApiBaseUrl();
const environment = detectEnvironment();

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: environment === "development" ? 10000 : 20000, // Longer timeout for production
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  environment,
};

// Helper function to create API URLs
export const createApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  // Log API configuration for debugging
  console.log("🔗 API Config:", {
    baseUrl: API_CONFIG.baseUrl,
    endpoint: cleanEndpoint,
    currentLocation:
      typeof window !== "undefined" ? window.location.href : "server",
  });

  // If we have a base URL, use it
  if (API_CONFIG.baseUrl) {
    const fullUrl = `${API_CONFIG.baseUrl}/api/${cleanEndpoint.replace("api/", "")}`;
    console.log("🌐 Full API URL:", fullUrl);
    return fullUrl;
  }

  // For development or same-domain, use relative URLs
  const relativeUrl = `/api/${cleanEndpoint.replace("api/", "")}`;
  console.log("🏠 Relative API URL:", relativeUrl);
  console.log("🌍 Environment:", environment);
  return relativeUrl;
};

// Enhanced fetch with timeout and retry
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = createApiUrl(endpoint);
  const controller = new AbortController();

  // Set timeout
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    console.log(`🌐 Making API request to: ${url}`, {
      method: options.method || 'GET',
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body
    });

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    console.log(
      `✅ API request completed: ${response.status} ${response.statusText}`,
      { url, ok: response.ok }
    );

    // Log response body for debugging
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);

    // Convert back to response-like object
    const responseClone = new Response(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    return responseClone;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`❌ API request failed:`, {
      url,
      error: error.message,
      name: error.name,
      cause: error.cause,
    });

    // Enhance error with more context
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${API_CONFIG.timeout}ms`);
    }

    if (error.message.includes("Failed to fetch")) {
      throw new Error(`Network error: Unable to connect to server at ${url}`);
    }

    throw error;
  }
};

// Specific API calls
export const adminApi = {
  getStats: async (token: string) => {
    const response = await apiRequest("admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  getUsers: async (token: string, limit = 10) => {
    const response = await apiRequest(`admin/users?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  getProperties: async (token: string, limit = 10) => {
    const response = await apiRequest(`admin/properties?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

// Auth API calls
export const authApi = {
  login: async (credentials: any) => {
    const response = await apiRequest("auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  sendOTP: async (data: any) => {
    const response = await apiRequest("auth/send-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  verifyOTP: async (data: any) => {
    const response = await apiRequest("auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

// General purpose API client
export const api = {
  get: async (endpoint: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiRequest(endpoint, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  post: async (endpoint: string, data?: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiRequest(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  put: async (endpoint: string, data?: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiRequest(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  delete: async (endpoint: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiRequest(endpoint, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};
