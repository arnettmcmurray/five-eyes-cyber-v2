const TOKEN_KEY = 'learner_token';
const HANDLE_KEY = 'learner_handle';

export function getSessionToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredHandle(): string | null {
  return localStorage.getItem(HANDLE_KEY);
}

export function setSession(token: string, handle: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(HANDLE_KEY, handle);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(HANDLE_KEY);
}
