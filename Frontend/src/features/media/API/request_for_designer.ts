// types/designerRequests.ts
// const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "") + "/designer";

export const DesignerRequestStatus = {
  Pending: 0,
  Accepted: 1,
  Completed: 2,
  Cancelled: 3,
} as const;

export type DesignerRequestStatusType =
  (typeof DesignerRequestStatus)[keyof typeof DesignerRequestStatus];

export interface ChangeRequestStatusPayload {
  requestId: number;
  status: DesignerRequestStatusType;
}

export interface ChangeRequestStatusResponse {
  success: boolean;
  message?: string;
  updatedRequestId?: number;
  newStatus?: DesignerRequestStatusType;
}

export async function changeDesignerRequestStatus(
  payload: ChangeRequestStatusPayload
): Promise<ChangeRequestStatusResponse> {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  if (!token) {
    throw new Error("توکن احراز هویت یافت نشد");
  }

  const res = await fetch(`http://localhost:5157/request/api/ProjectRequest/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "خطا در تغییر وضعیت درخواست");
  }

  return res.json();
}
