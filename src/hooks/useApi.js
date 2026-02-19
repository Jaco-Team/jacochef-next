import axios from "axios";
import queryString from "query-string";
import { api_laravel as api_fallback } from "../api_new";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/",
  timeout: 300_000, // ms
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
 * NEW api_laravel wrapper (v2)
 *
 * ⚠️ WARNING:
 * Same name as legacy src/api_new api_laravel.
 * NOT fully backward compatible and may fail on old code
 */

export default function useApi(module) {
  // FALLBACK
  if (!process.env.NEXT_PUBLIC_API_URL) {
    const fallback_laravel = (...args) => {
      console.log("api_laravel fallback mode. Missing .env config");
      api_fallback(module, ...args);
    };
    const fallback_upload = () => console.log("api_upload fallback mode. Missing .env config");
    return {
      api_laravel: fallback_laravel,
      api_upload: fallback_upload,
    };
  }

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
