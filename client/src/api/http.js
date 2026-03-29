import axios from "axios";

const storageKey = "wbj_auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

export function getStoredAuth() {
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : null;
}

export function persistAuth(payload) {
  localStorage.setItem(storageKey, JSON.stringify(payload));
}

export function clearStoredAuth() {
  localStorage.removeItem(storageKey);
}

