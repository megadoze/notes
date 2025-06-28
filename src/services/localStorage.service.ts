const TOKEN_KEY = "idToken";
const REFRESH_KEY = "refreshToken";
const EXPIRES_KEY = "expiresDate";
const USERID_KEY = "localId";

export function setTokens({ idToken, refreshToken, localId, expiresIn = 3600 }) {
  const expiresDate = new Date().getTime() + expiresIn * 1000;
  localStorage.setItem(TOKEN_KEY, idToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(EXPIRES_KEY, expiresDate);
  localStorage.setItem(USERID_KEY, localId);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getExpiresDate() {
  return localStorage.getItem(EXPIRES_KEY);
}

export function getUserId() {
  return localStorage.getItem(USERID_KEY);
}

export function removeAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  localStorage.removeItem(USERID_KEY);
}

const localStorageService = {
  setTokens,
  getAccessToken,
  getRefreshToken,
  getExpiresDate,
  getUserId,
  removeAuthData,
};

export default localStorageService;
