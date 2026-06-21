const STORAGE_KEY = "lonewolf_session";

export function setSession(token, user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

export function getSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

export function getUser() {
  const session = getSession();
  return session ? session.user : null;
}

export function isLoggedIn() {
  return getToken() !== null;
}

export function isAdmin() {
  const user = getUser();
  return user !== null && user.role === "admin";
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
