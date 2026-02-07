import axios from "axios";

/* ✅ جایگزین enum */
export const DesignerRequestStatus = {
  Pending: 0,
  Accepted: 1,
  Completed: 2,
  Cancelled: 3,
} as const;

/* ✅ نوع تایپی امن */
export type DesignerRequestStatusType =
  (typeof DesignerRequestStatus)[keyof typeof DesignerRequestStatus];

interface ChangeRequestStatusPayload {
  requestId: number;
  status: DesignerRequestStatusType;
}

export async function changeDesignerRequestStatus(
  payload: ChangeRequestStatusPayload
) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  if (!token) {
    throw new Error("توکن احراز هویت یافت نشد");
  }

  const { data } = await axios.post(
    "/api/designer/requests/status",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}
