import {
  BASE_URL,
  clearClientAuth,
  extractApiMessage,
  makeApiError,
  readAccessTokenLS,
  readResponseBody,
  toastIfApiSuccess,
  writeAccessTokenLS,
} from "./base";

/* ===================== Constants ===================== */

const AUTH_REFRESH_TOKEN_PATH = "/api/Auth/refresh";

/* ===================== Auth ===================== */

export async function refreshAccessTokenFromCookie(): Promise<string> {
  const res = await fetch(`${BASE_URL}/iam${AUTH_REFRESH_TOKEN_PATH}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    clearClientAuth();
    throw makeApiError(extractApiMessage(data, text), res.status, data);
  }

  const newToken = data?.accessToken || data?.AccessToken || data?.token || data?.Token;
  if (!newToken) {
    clearClientAuth();
    throw makeApiError("توکن جدید از سرور دریافت نشد");
  }

  writeAccessTokenLS(newToken);
  return newToken;
}

export async function apiJsonWithBearer<T>(
  path: string,
  init: RequestInit,
  opts?: { preRefresh?: boolean }
): Promise<T> {
  const url = `${BASE_URL}/iam${path}`;

  const doFetch = (token: string) =>
    fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers as any),
      },
      credentials: "include",
    });

  let token = readAccessTokenLS();
  if (opts?.preRefresh) token = await refreshAccessTokenFromCookie();

  let res = await doFetch(token);

  if (res.status === 401) {
    token = await refreshAccessTokenFromCookie();
    res = await doFetch(token);
  }

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    throw makeApiError(extractApiMessage(data, text), res.status, data);
  }

  toastIfApiSuccess(data);
  return data as T;
}
