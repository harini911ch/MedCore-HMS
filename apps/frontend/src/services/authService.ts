export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  role: string;
  userId?: string;
}

const AUTH_URL = "http://localhost:8081/api/auth";

export async function login(
  credentials: LoginRequest,
): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error(
      "Unable to connect to MedCore HMS. Check that the backend is running on port 8081.",
    );
  }

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = result as
      | { message?: string; error?: string }
      | null;

    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid email or password. Please try again.");
    }

    throw new Error(
      body?.message ||
        body?.error ||
        `Login failed with status ${response.status}.`,
    );
  }

  const data = result as Partial<AuthResponse> | null;

  if (!data?.accessToken || !data.role) {
    throw new Error(
      "The server response is missing the access token or user role.",
    );
  }

  return data as AuthResponse;
}

export function saveAuthSession(auth: AuthResponse): void {
  sessionStorage.setItem("medcore.accessToken", auth.accessToken);
  sessionStorage.setItem("medcore.role", auth.role);

  if (auth.userId) {
    sessionStorage.setItem("medcore.userId", auth.userId);
  } else {
    sessionStorage.removeItem("medcore.userId");
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem("medcore.accessToken");
  sessionStorage.removeItem("medcore.role");
  sessionStorage.removeItem("medcore.userId");
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem("medcore.accessToken");
}

export function getUserRole(): string | null {
  return sessionStorage.getItem("medcore.role");
}

export function getUserId(): string | null {
  return sessionStorage.getItem("medcore.userId");
}