// src/features/auth/utils/authStorage.ts
export type StoredUser = {
  UserId?: number | string;
  FullName?: string;
  Email?: string;
  Role?: string;
  IsVerified?: boolean;
  [key: string]: any;
};

const KEYS = {
  token: "token",
  refreshToken: "refreshToken",
  fullName: "fullName",
  user: "user",
  userId: "userId",
  userRole: "userRole",
};

export function emitAuthChanged() {
  window.dispatchEvent(new Event("authChanged"));
}

export function readToken(): string {
  return localStorage.getItem(KEYS.token) || "";
}

export function readFullName(): string {
  return localStorage.getItem(KEYS.fullName) || "";
}

export function readUser(): StoredUser | null {
  const raw = localStorage.getItem(KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!readToken().trim();
}

export function persistAuth(args: {
  token: string;
  refreshToken?: string;
  user?: StoredUser | null;
  fullName?: string;
}) {
  if (args.token) localStorage.setItem(KEYS.token, args.token);
  if (args.refreshToken) localStorage.setItem(KEYS.refreshToken, args.refreshToken);

  const fullName = args.fullName || args.user?.FullName || "";
  if (fullName) localStorage.setItem(KEYS.fullName, fullName);

  if (args.user) {
    localStorage.setItem(KEYS.user, JSON.stringify(args.user));
    if (args.user.UserId != null) localStorage.setItem(KEYS.userId, String(args.user.UserId));
    if (args.user.Role) localStorage.setItem(KEYS.userRole, String(args.user.Role));
  }

  emitAuthChanged();
}

export function clearAuth() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  emitAuthChanged();
}
