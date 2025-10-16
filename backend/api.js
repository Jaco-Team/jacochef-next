"use server";

import axios from "axios";
// 1) фикс импорта cookie
import { parse } from "cookie";
// (опционально: у query-string лучше забирать именованный stringify)
import { stringify } from "query-string";

export async function getDataSSR(
  module,
  method,
  rawCookies = "",
  data = {},
  dop_type = {}
) {
  let redirect = null;

  // 2) используем именованную функцию
  const cookies = parse(rawCookies || "");
  const login = cookies.token || null;

  if (!login) {
    console.log("No login");
    return { redirect: { destination: "/auth", permanent: false } };
  }

  const apiUrl = `${
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/"
  }/${module}/${method}`;

  const requestData = stringify({
    method,
    module,
    version: 2,
    login,
    data: JSON.stringify(data),
  });

  try {
    // 3) axios по умолчанию кидает исключение на 4xx/5xx.
    // Если хочешь обработать 401/403 в этом же блоке — разреши любой статус:
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
    return null; // fail silently for SSR
  }
}