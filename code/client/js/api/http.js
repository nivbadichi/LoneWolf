import { API_BASE_URL } from "./config.js";
import { getToken } from "../utils/auth.js";

export async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data.errors ? data.errors[0].msg : data.message;
    throw new Error(message || "Something went wrong");
  }

  return data;
}
