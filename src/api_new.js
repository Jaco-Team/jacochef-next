import queryString from "query-string";
import axios from "axios";

/**
 * Keep FE and API on the same hostname (localhost vs 127.0.0.1 are different sites).
 * Cross-port (3000 → 8000) needs withCredentials + withXSRFToken so Axios sends X-XSRF-TOKEN.
 */
function getApiBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return fromEnv.replace(/\/?$/, "");
}

function getApiOrigin() {
  return getApiBaseUrl().replace(/\/api$/i, "") || "http://localhost:8000";
}

export const credentialsConfig = {
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
};

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

export function sanctum(dop_type = {}) {
  const urlApi_dev = `${getApiOrigin()}/sanctum/csrf-cookie`;

  return axios
    .get(urlApi_dev, {
      ...credentialsConfig,
      ...dop_type,
    })
    .then((response) => response)
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export function api_laravel(module = "", method = "", data = {}, dop_type = {}) {
  const urlApi_dev = `${getApiBaseUrl()}/${module}/${method}`;

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,
    data: JSON.stringify(data),
  });

  const config = {
    ...credentialsConfig,
    ...dop_type,
  };

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
  const urlApi_dev = `${getApiBaseUrl()}/${module}/${method}`;

  const this_data = queryString.stringify({
    method: method,
    module: module,
    version: 2,
    data: JSON.stringify(data),
  });

  return axios
    .post(urlApi_dev, this_data, {
      ...credentialsConfig,
      ...dop_type,
    })
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
  const urlApi_dev = `${getApiBaseUrl()}/${module}/${method}`;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("method", method);
  formData.append("module", module);
  formData.append("version", 2);
  formData.append("data", JSON.stringify(data));

  return axios
    .post(urlApi_dev, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...credentialsConfig,
      ...dop_type,
    })
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
  const apiUrl = "https://apichef.jacochef.ru/api/";
  const url = `${apiUrl.replace(/\/$/, "")}/${module}/${method}`;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("method", method);
  formData.append("module", module);
  formData.append("version", 2);
  formData.append("data", JSON.stringify(data));

  return axios
    .post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...credentialsConfig,
      ...dop_type,
    })
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
