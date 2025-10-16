"use server";

import axios from "axios";
import { parse } from "cookie";
import queryString from "query-string"; // ← исправлено

export async function getDataSSR(
  module,
  method,
  rawCookies = "",
  data = {},
  dop_type = {}
) {
  let redirect = null;

  const cookies = parse(rawCookies || "");
  const login = cookies.token || null;

  if (!login) {
    console.log("No login");
    return { redirect: { destination: "/auth", permanent: false } };
  }

  const apiUrl = `${
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/"
  }/${module}/${method}`;

  const requestData = queryString.stringify({
    method,
    module,
    version: 2,
    login,
    data: JSON.stringify(data),
  });

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      validateStatus: () => true,
      ...dop_type,
    });

    if (response.status === 401)
      redirect = { destination: "/auth", permanent: false };
    if (response.status === 403)
      redirect = { destination: "/", permanent: false };

    if (redirect) return { redirect };
    return response.data;
  } catch (err) {
    console.error("SSR fetch error:", err);
    return null;
  }
}