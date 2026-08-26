import queryString from "query-string";
import axios from "axios";

const PROD_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://apichef.jacochef.ru/api"
).replace(/\/+$/, "");
const LOCAL_API_BASE_URL = "http://localhost:8080/api";
const AUTH_TOKEN_STORAGE_KEY = "chef_auth_token";

function getApiOrigin(apiBaseUrl) {
  return apiBaseUrl.replace(/\/api$/i, "");
}

const sessionCredentialsConfig = {
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
};

export function getAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
}

export function storeAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  const value = typeof token === "string" ? token.trim() : "";
  if (value) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, value);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function createLegacyToken(login, userId) {
  if (typeof window === "undefined" || !login || !userId) {
    return "";
  }

  return window.btoa(`${login}-_-${userId}`);
}

export function getAuthHeaders(headers = {}) {
  const token = getAuthToken();

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const credentialsConfig = {
  withCredentials: false,
  withXSRFToken: false,
  get headers() {
    return getAuthHeaders();
  },
};

function getLaravelRequestConfig(config = {}) {
  return {
    ...credentialsConfig,
    ...config,
    headers: getAuthHeaders(config.headers),
  };
}

export function api(module = "", method = "", data = {}, dop_type = {}) {
  //const urlApi_dev = 'http://127.0.0.1:8000/api/'+module+'/'+method;
  //const urlApi_dev = 'https://79.174.91.113/api/'+module+'/'+method;

  const urlApi_dev = "https://jacochef.ru/api/index_new.php";

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,

    login: localStorage.getItem("token"),
    data: JSON.stringify(data),
  });

  return axios
    .post(urlApi_dev, this_data, dop_type)
    .then((response) => {
      if (typeof response.data == "string") {
        return {
          st: false,
          text: response.data,
        };
      }

      return response; // react
      //return response.data; // lara
    })
    .catch((error) => {
      console.log(error?.response?.status);

      if (error?.response?.status == 401) {
        window.location.pathname = "/auth";
      }

      if (error?.response?.status == 403) {
        window.location.pathname = "/";
      }
    });
}

function requestSanctum(apiBaseUrl, dop_type = {}) {
  const urlApi_dev = `${getApiOrigin(apiBaseUrl)}/sanctum/csrf-cookie`;

  return axios
    .get(urlApi_dev, {
      ...sessionCredentialsConfig,
      ...dop_type,
    })
    .then((response) => response)
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export function sanctum(dop_type = {}) {
  return requestSanctum(PROD_API_BASE_URL, dop_type);
}

export function sanctum_local(dop_type = {}) {
  return requestSanctum(LOCAL_API_BASE_URL, dop_type);
}

export function api_laravel(module = "", method = "", data = {}, dop_type = {}) {
  const urlApi_dev = `${PROD_API_BASE_URL}/${module}/${method}`;

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,
    data: JSON.stringify(data),
  });

  const config = getLaravelRequestConfig(dop_type);

  return axios
    .post(urlApi_dev, this_data, config)
    .then((response) => {
      if (typeof response.data == "string") {
        return {
          st: false,
          text: response.data,
        };
      }
      return response.data;
    })
    .catch((error) => {
      console.log(error?.response?.status);

      if (error?.response?.status == 401) {
        window.location = "/auth";
      }

      if (error?.response?.status == 403) {
        window.location = "/";
      }

      if (dop_type?.throwErrors || error?.response?.status == 419) {
        throw error;
      }
    });
}

export function api_laravel_local(module = "", method = "", data = {}, dop_type = {}) {
  const urlApi_dev = `${LOCAL_API_BASE_URL}/${module}/${method}`;

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,
    data: JSON.stringify(data),
  });

  return axios
    .post(urlApi_dev, this_data, getLaravelRequestConfig(dop_type))
    .then((response) => {
      if (typeof response.data == "string") {
        return {
          st: false,
          text: response.data,
        };
      }

      return response.data;
    })
    .catch((error) => {
      console.log(error?.response?.status);

      if (error?.response?.status == 401) {
        window.location = "/auth";
      }

      if (error?.response?.status == 403) {
        window.location = "/";
      }

      if (dop_type?.throwErrors || error?.response?.status == 419) {
        throw error;
      }
    });
}

export function api_laravel_local_upload(module = "", method = "", file, data = {}, dop_type = {}) {
  const urlApi_dev = `${LOCAL_API_BASE_URL}/${module}/${method}`;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("method", method);
  formData.append("module", module);
  formData.append("version", 2);
  formData.append("data", JSON.stringify(data));

  return axios
    .post(
      urlApi_dev,
      formData,
      getLaravelRequestConfig({
        ...dop_type,
        headers: {
          "Content-Type": "multipart/form-data",
          ...dop_type.headers,
        },
      }),
    )
    .then((response) => {
      if (typeof response.data == "string") {
        return {
          st: false,
          text: response.data,
        };
      }

      return response.data;
    })
    .catch((error) => {
      console.log(error?.response?.status);

      if (error?.response?.status == 401) {
        window.location = "/auth";
      }

      if (error?.response?.status == 403) {
        window.location = "/";
      }
    });
}

export function api_laravel_upload(module = "", method = "", file, data = {}, dop_type = {}) {
  const url = `${PROD_API_BASE_URL}/${module}/${method}`;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("method", method);
  formData.append("module", module);
  formData.append("version", 2);
  formData.append("data", JSON.stringify(data));

  return axios
    .post(
      url,
      formData,
      getLaravelRequestConfig({
        ...dop_type,
        headers: {
          "Content-Type": "multipart/form-data",
          ...dop_type.headers,
        },
      }),
    )
    .then((response) => {
      if (typeof response.data == "string") {
        return {
          st: false,
          text: response.data,
        };
      }

      return response.data;
    })
    .catch((error) => {
      console.log(error?.response?.status);

      if (error?.response?.status == 401) {
        window.location = "/auth";
      }

      if (error?.response?.status == 403) {
        window.location = "/";
      }
    });
}
