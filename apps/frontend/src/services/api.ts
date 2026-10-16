import { getAccessToken } from "./authService";

const API_BASE_URL = "http://localhost:8081/api";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/${path.replace(/^\/+/, "")}`,
      {
        ...options,
        headers,
        body:
          options.body === undefined
            ? undefined
            : JSON.stringify(options.body),
      },
    );
  } catch {
    throw new Error(
      "Unable to connect to MedCore HMS. Check that the backend is running on port 8081.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  let data: unknown;

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data && typeof data === "object") {
      const errorData = data as {
        message?: string;
        error?: string;
        detail?: string;
      };

      message =
        errorData.message ||
        errorData.detail ||
        errorData.error ||
        message;
    }

    if (response.status === 401) {
      message = "Your session may have expired. Please sign in again.";
    }

    throw new Error(message);
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, {
    method: "GET",
  });
}

export function apiPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body,
  });
}

export function apiPut<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body,
  });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    ...(body === undefined ? {} : { body }),
  });
}

export function apiDelete<T = void>(
  path: string,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "DELETE",
  });
}
