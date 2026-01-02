import { BASE_URL, makeApiError, extractApiMessage, readResponseBody } from "./base";
import { refreshAccessTokenFromCookie } from "./auth";
import { prettyAlert } from "../components/pretty_alert";

/* ===================== Types ===================== */

export type DesignerExtraProfilePayload = {
  bio: string;
  location: string;
  specialty: string;
  avatarFile?: File | null;
};

export type DesignerExtraProfileResult = {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
};

/* ===================== API ===================== */

export async function saveDesignerExtraProfile(
  payload: DesignerExtraProfilePayload
): Promise<DesignerExtraProfileResult> {
  const url = `${BASE_URL}/portfolio/api/portfolios/profile`;

  const fd = new FormData();
  fd.append("Bio", payload.bio);
  fd.append("Location", payload.location);
  fd.append("Specialty", payload.specialty);
  if (payload.avatarFile) fd.append("AvatarFile", payload.avatarFile);

  let token = await refreshAccessTokenFromCookie();
  let res = await fetch(url, {
    method: "POST",
    body: fd,
    credentials: "include",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    token = await refreshAccessTokenFromCookie();
    res = await fetch(url, {
      method: "POST",
      body: fd,
      credentials: "include",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
  }

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    throw makeApiError(extractApiMessage(data, text), res.status, data);
  }

  prettyAlert(data?.message || "اطلاعات تکمیلی با موفقیت بروزرسانی شد ✅", "success");
  return data ?? { success: true };
}
