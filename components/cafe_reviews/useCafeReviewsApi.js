import { useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";

export default function useCafeReviewsApi() {
  const { api_laravel } = useApi("cafe_reviews");
  const apiRef = useRef(api_laravel);
  apiRef.current = api_laravel;

  return useMemo(() => {
    const isBlob = (value) => typeof Blob !== "undefined" && value instanceof Blob;
    const unwrapJsonEnvelope = (value) => {
      if (!value || typeof value !== "object" || Array.isArray(value) || isBlob(value)) {
        return value;
      }

      const keys = Object.keys(value);
      const isApiEnvelope =
        Object.prototype.hasOwnProperty.call(value, "data") &&
        keys.every((key) => ["data", "links", "meta"].includes(key));

      return isApiEnvelope ? value.data : value;
    };
    const request = async (method, payload = {}, options = {}) => {
      const requestOptions = { ...options, throwErrors: true };
      const response = await apiRef.current(method, payload, requestOptions);
      if (options.responseType === "blob" || isBlob(response)) return response;
      return unwrapJsonEnvelope(response);
    };

    return {
      getBootstrap: () => request("get_all"),
      getDashboard: (payload) => request("dashboard", payload),
      getReviews: (payload) => request("reviews", payload),
      getReview: (id) => request("review", { id }),
      getIncidents: (payload) => request("incidents", payload),
      getLinks: (payload) => request("links", payload),
      generateLink: (payload) => request("link/generate", payload),
      revokeLink: (payload) => request("link/revoke", payload),
      getIncident: (id) => request("incident", { id }),
      updateIncident: (payload) => request("incident/update", payload),
      decideAi: (payload) => request("incident/ai-decision", payload),
      getPhoto: (id) => request(`photos/${id}/view`, {}, { responseType: "blob" }),
    };
  }, []);
}
