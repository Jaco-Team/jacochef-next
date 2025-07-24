import queryString from "query-string";
import axios from "axios";

function getApiBase() {
  const env = process.env.NODE_ENV;
  if (env === "production") {
    return "https://apichef.jacochef.ru/api/";
  } else if (env === "development") {
    console.info("DEV ENVIRONMENT");
    return "http://127.0.0.1:8000/api/";
  }

  throw new Error(`Unknown environment: ${env}`);
}

export function api_laravel(module = "", method = "", data = {}, dop_type = {}) {
  const url = `${getApiBase()}${module}/${method}`;

  const payload = queryString.stringify({
    method,
    module,
    version: 2,
    login: localStorage.getItem("token") || "",
    data: JSON.stringify(data),
  });

  return axios
    .post(url, payload, dop_type)
    .then((response) => {
      if (typeof response.data === "string") {
        return {
          st: false,
          text: response.data,
        };
      }
      return response.data;
    })
    .catch((error) => {
      console.error("API Error:", error?.response?.status, error?.message);

      if (error?.response?.status === 401) {
        window.location = "/auth";
      }

      if (error?.response?.status === 403) {
        window.location = "/";
      }

      return {
        st: false,
        error: true,
        status: error?.response?.status || 500,
        message: error?.message || "Unknown error",
      };
    });
}
