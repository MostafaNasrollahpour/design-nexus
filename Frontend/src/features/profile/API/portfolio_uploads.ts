import { BASE_URL, extractApiMessage, makeApiError, readResponseBody, toastIfApiSuccess } from "./base";
import { refreshAccessTokenFromCookie } from "./auth";

/* ===================== Types ===================== */

export type UploadDesignPayload = {
  title: string;
  description: string | null;
  categoryId: number;
  imageFile: File;
};


export type UploadDesignResult = {
  success?: boolean;
  message?: string;
  [key: string]: any;
};

/* ===================== Constants ===================== */

const PORTFOLIOS_PATH = "/api/portfolios";

/* ===================== API ===================== */

export async function uploadDesignerDesign(
  payload: UploadDesignPayload
): Promise<UploadDesignResult | null> {
  const url = `${BASE_URL}/portfolio${PORTFOLIOS_PATH}`;

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("Title", payload.title);
    fd.append("CategoryId", String(payload.categoryId));
    fd.append("Description", payload.description || "");
    fd.append("ImageFile", payload.imageFile);
    return fd;
  };

  let token = await refreshAccessTokenFromCookie();
  let res = await fetch(url, {
    method: "POST",
    body: buildFormData(),
    credentials: "include",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    token = await refreshAccessTokenFromCookie();
    res = await fetch(url, {
      method: "POST",
      body: buildFormData(),
      credentials: "include",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
  }

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    throw makeApiError(extractApiMessage(data, text), res.status, data);
  }

  toastIfApiSuccess(data);
  return data ?? null;
}
