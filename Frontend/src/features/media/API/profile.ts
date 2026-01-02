import { apiJsonWithBearer } from "./auth";

/* ===================== Types ===================== */

export type ProfileSettingsPayload = {
  fullName: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

export type ProfileSettingsResult = {
  success?: boolean;
  message?: string;
  user?: any;
  [key: string]: any;
};

/* ===================== Constants ===================== */

const USER_UPDATE_PROFILE_PATH = "/api/Auth/update-profile";

/* ===================== API ===================== */

export async function saveProfileSettings(
  payload: ProfileSettingsPayload
): Promise<ProfileSettingsResult> {
  const hasPasswordChange =
    !!payload.currentPassword?.trim() ||
    !!payload.newPassword?.trim() ||
    !!payload.confirmNewPassword?.trim();

  if (hasPasswordChange) {
    if (!payload.currentPassword || !payload.newPassword || !payload.confirmNewPassword) {
      throw new Error("برای تغییر رمز عبور، هر سه فیلد رمز را کامل پر کنید.");
    }
    if (payload.newPassword !== payload.confirmNewPassword) {
      throw new Error("رمز عبور جدید و تکرار آن یکسان نیست.");
    }
  }

  const body: any = {
    FullName: payload.fullName,
    fullName: payload.fullName,
  };

  if (hasPasswordChange) {
    Object.assign(body, {
      CurrentPassword: payload.currentPassword,
      NewPassword: payload.newPassword,
      ConfirmNewPassword: payload.confirmNewPassword,
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmNewPassword: payload.confirmNewPassword,
    });
  }

  return apiJsonWithBearer(USER_UPDATE_PROFILE_PATH, {
    method: "PUT",
    body: JSON.stringify(body),
  }, { preRefresh: true });
}
