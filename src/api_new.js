import queryString from "query-string";
import axios from "axios";
import Cookies from "js-cookie";

const PROD_API_BASE_URL = "http://127.0.0.1:8000/api";
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

export function storeAuthSession(payload, login) {
  storeAuthToken(payload?.token);

  if (typeof window === "undefined") {
    return;
  }

  const legacyToken = payload?.legacy_token || createLegacyToken(login, payload?.user_id);
  if (legacyToken) {
    localStorage.setItem("token", legacyToken);
    Cookies.set("token", legacyToken, {
      expires: 60,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });
  }

  if (payload?.expires_at) {
    localStorage.setItem("auth_expires_at", payload.expires_at);
  }
}

export function getAuthHeaders(headers = {}) {
  const token = getAuthToken();

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function isSameOriginApi(apiBaseUrl) {
  if (typeof window === "undefined") {
    return false;
  }

  return new URL(apiBaseUrl, window.location.origin).origin === window.location.origin;
}

export const credentialsConfig = {
  get withCredentials() {
    return isSameOriginApi(PROD_API_BASE_URL);
  },
  get withXSRFToken() {
    return isSameOriginApi(PROD_API_BASE_URL);
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  get headers() {
    return getAuthHeaders();
  },
};

function getLaravelRequestConfig(apiBaseUrl, config = {}) {
  return {
    ...credentialsConfig,
    withCredentials: false,
    withXSRFToken: false,
    ...config,
    ...(isSameOriginApi(apiBaseUrl) ? sessionCredentialsConfig : {}),
    headers: getAuthHeaders(config.headers),
  };
}

export function api(module = "", method = "", data = {}, dop_type = {}) {
  //const urlApi_dev = 'http://127.0.0.1:8000/api/'+module+'/'+method;
  //const urlApi_dev = 'https://79.174.91.113/api/'+module+'/'+method;

  const urlApi_dev = "http://127.0.0.1:8000/api/index_new.php";

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

const sameOriginCsrfState = new Map();

function getSameOriginLaravelBase(config) {
  if (typeof window === "undefined") {
    return null;
  }

  const requestUrl = new URL(axios.getUri(config), window.location.origin);
  for (const apiBaseUrl of [PROD_API_BASE_URL, LOCAL_API_BASE_URL]) {
    const base = new URL(apiBaseUrl, window.location.origin);
    const apiPath = base.pathname.replace(/\/+$/, "");
    if (
      base.origin === window.location.origin &&
      requestUrl.origin === base.origin &&
      (requestUrl.pathname === apiPath || requestUrl.pathname.startsWith(`${apiPath}/`))
    ) {
      return apiBaseUrl;
    }
  }

  return null;
}

function hasXsrfCookie() {
  return typeof document !== "undefined" && document.cookie.split(";").some(
    (cookie) => /^XSRF-TOKEN=.+/.test(cookie.trim()),
  );
}

function ensureSameOriginCsrf(apiBaseUrl) {
  const origin = getApiOrigin(apiBaseUrl);
  const existing = sameOriginCsrfState.get(origin);
  if (existing?.promise) {
    return existing.promise;
  }
  if (existing?.ready && hasXsrfCookie()) {
    return Promise.resolve();
  }

  const state = { ready: false, promise: null };
  sameOriginCsrfState.set(origin, state);
  state.promise = requestSanctum(apiBaseUrl, { timeout: 15000 })
    .then(() => {
      if (!hasXsrfCookie()) {
        throw new Error("CSRF cookie is unavailable. Refresh the page and try again.");
      }
      state.ready = true;
    })
    .finally(() => {
      state.promise = null;
    });
  return state.promise;
}

axios.interceptors.request.use(async (config) => {
  if (!["post", "put", "patch", "delete"].includes((config.method || "get").toLowerCase())) {
    return config;
  }

  const apiBaseUrl = getSameOriginLaravelBase(config);
  if (apiBaseUrl) {
    await ensureSameOriginCsrf(apiBaseUrl);
    Object.assign(config, sessionCredentialsConfig);
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 419 && error.config) {
      const apiBaseUrl = getSameOriginLaravelBase(error.config);
      if (apiBaseUrl) {
        sameOriginCsrfState.delete(getApiOrigin(apiBaseUrl));
      }
    }
    return Promise.reject(error);
  },
);

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

  const config = getLaravelRequestConfig(PROD_API_BASE_URL, dop_type);

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
    .post(urlApi_dev, this_data, getLaravelRequestConfig(LOCAL_API_BASE_URL, dop_type))
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
      getLaravelRequestConfig(LOCAL_API_BASE_URL, {
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
      getLaravelRequestConfig(PROD_API_BASE_URL, {
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


// Dropzone 6.0.0-beta.2 uses raw XHR; the Axios interceptor does not cover it.
function billingUploadTrustedApiBase(dropzone) {
  if (typeof window === "undefined") {
    return null;
  }

  let requestUrl;
  try {
    requestUrl = new URL(dropzone.options.url, window.location.origin);
  } catch (_) {
    return null;
  }
  const pageHostname = new URL(window.location.origin).hostname;
  for (const apiBaseUrl of [PROD_API_BASE_URL, LOCAL_API_BASE_URL]) {
    const base = new URL(apiBaseUrl, window.location.origin);
    if (
      apiBaseUrl === LOCAL_API_BASE_URL &&
      pageHostname !== "localhost" &&
      pageHostname !== "127.0.0.1"
    ) {
      continue;
    }
    const apiPath = base.pathname.replace(/\/+$/, "");
    if (
      requestUrl.origin === base.origin &&
      !requestUrl.username &&
      !requestUrl.password &&
      ["bill-items/upload", "bill-ex-items/upload"].some(
        (path) => requestUrl.pathname === `${apiPath}/${path}`,
      )
    ) {
      return apiBaseUrl;
    }
  }
  return null;
}

function billingUploadApiBase(dropzone) {
  const apiBaseUrl = billingUploadTrustedApiBase(dropzone);
  return apiBaseUrl && isSameOriginApi(apiBaseUrl) ? apiBaseUrl : null;
}

function billingUploadXsrfCookie() {
  const values = document.cookie.split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith("XSRF-TOKEN="));
  if (values.length !== 1) {
    throw new Error("Upload CSRF cookie is unavailable. Refresh the page and try again.");
  }
  let token;
  try {
    token = decodeURIComponent(values[0].slice("XSRF-TOKEN=".length));
  } catch (_) {
    throw new Error("Upload CSRF cookie is invalid. Refresh the page and try again.");
  }
  if (!token || token.length > 8192 || /[^\x21-\x7e]/.test(token)) {
    throw new Error("Upload CSRF cookie is invalid. Refresh the page and try again.");
  }
  return token;
}

export async function prepareBillingUploads(dropzones) {
  await Promise.all(dropzones.filter(Boolean).map(async (dropzone) => {
    const apiBaseUrl = billingUploadApiBase(dropzone);
    if (apiBaseUrl) {
      await ensureSameOriginCsrf(apiBaseUrl);
      billingUploadXsrfCookie();
      return;
    }
    if (billingUploadTrustedApiBase(dropzone) && !getAuthToken()) {
      throw new Error("Upload authorization is unavailable. Sign in and try again.");
    }
  }));
}

export function resetBillingUploadCsrf(dropzone, xhr) {
  if (Number(xhr?.status) !== 419) {
    return;
  }
  const apiBaseUrl = billingUploadApiBase(dropzone);
  if (apiBaseUrl) {
    sameOriginCsrfState.delete(getApiOrigin(apiBaseUrl));
  }
}

export function setBillingUploadCsrf(dropzone, file, xhr) {
  const trustedApiBaseUrl = billingUploadTrustedApiBase(dropzone);
  if (!trustedApiBaseUrl) {
    return true;
  }
  const sameOriginApiBaseUrl = billingUploadApiBase(dropzone);
  try {
    if (xhr.readyState !== 1) {
      throw new Error("Upload request is unavailable.");
    }
    if (sameOriginApiBaseUrl) {
      const token = billingUploadXsrfCookie();
      xhr.withCredentials = true;
      xhr.setRequestHeader("X-XSRF-TOKEN", token);
    }
    const authToken = getAuthToken();
    if (!sameOriginApiBaseUrl && !authToken) {
      throw new Error("Upload authorization is unavailable.");
    }
    if (authToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
    }
    return true;
  } catch (_) {
    if (sameOriginApiBaseUrl) {
      sameOriginCsrfState.delete(getApiOrigin(sameOriginApiBaseUrl));
    }
    // abort() resets OPENED to UNSENT; Dropzone submitRequest then refuses send.
    xhr.abort();
    file.chefCsrfFailure = true;
    file.status = "error";
    dropzone.emit("error", file, "Изображение не отправлено: обнови страницу и повтори загрузку.", xhr);
    dropzone.emit("complete", file);
    return false;
  }
}
