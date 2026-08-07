import axios from "axios";
import queryString from "query-string";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error("Config API_URL is required");
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 300_000, // ms
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

// если это включаем, начинаются Preflight запросы, пока что не надо
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) window.location = "/auth";
    if (status === 403) window.location = "/";
    return Promise.reject(error);
  },
);

/**
 * Canonical API wrapper for module-scoped v2 requests.
 */

export default function useApi(module) {
  async function api_laravel(method, data = {}, options = {}) {
    const payload = queryString.stringify({
      method,
      module,
      version: 2,
      login: localStorage.getItem("token"),
      data: JSON.stringify(data),
    });

    try {
      const response = await apiClient.post(`${module}/${method}`, payload, options);
      if (options.responseType === "blob") {
        return response;
      }
      if (typeof response.data === "string") {
        return { st: false, text: response.data };
      }
      return response.data;
    } catch (error) {
      // console.error(error);
      throw error;
    }
  }

  async function api_upload(method, file, extraData = {}) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);
    formData.append("login", localStorage.getItem("token"));
    formData.append("module", module);
    formData.append("version", 2);
    formData.append("data", JSON.stringify(extraData));

    try {
      const response = await apiClient.post(`${module}/${method}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return { api_laravel, api_upload };
}
