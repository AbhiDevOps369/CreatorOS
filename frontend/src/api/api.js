import axios from "axios";

export const API_BASE = "http://localhost:3000/api/v1";

/*
 * Tokens live in memory only (never localStorage). The backend also sets
 * httpOnly cookies on login/refresh, which is what lets a hard reload
 * restore the session via GET /auth/current-user.
 */
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401: try one refresh, retry the original request, else surface auth expiry.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh-token");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        // dedupe concurrent refreshes — every 401 in flight awaits the same call
        refreshPromise =
          refreshPromise ||
          axios.post(`${API_BASE}/auth/refresh-token`, {}, { withCredentials: true });
        const { data } = await refreshPromise;
        refreshPromise = null;
        const newToken = data?.data?.accessToken;
        if (newToken) setAccessToken(newToken);
        return api(original);
      } catch (refreshError) {
        refreshPromise = null;
        setAccessToken(null);
        window.dispatchEvent(new Event("auth:expired"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/*
 * Client portal — a completely separate auth space. Clients authenticate
 * against /portal/login (verifyJwt("client")), and there is no client
 * refresh endpoint, so a 401 simply ends the portal session.
 */
let portalToken = null;
export const setPortalToken = (token) => {
  portalToken = token;
};

export const portalApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

portalApi.interceptors.request.use((config) => {
  if (portalToken) {
    config.headers.Authorization = `Bearer ${portalToken}`;
  }
  return config;
});

portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.includes("/portal/login")) {
      setPortalToken(null);
      window.dispatchEvent(new Event("portal-auth:expired"));
    }
    return Promise.reject(error);
  }
);

/* Pulls the human-readable message out of an ApiError response. */
export const errorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || err?.message || fallback;
