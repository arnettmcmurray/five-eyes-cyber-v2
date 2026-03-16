const TOKEN_KEY = 'admin_token';
const USERNAME_KEY = 'admin_username';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setAdminSession(token: string, username: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
}

export function clearAdminSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}
