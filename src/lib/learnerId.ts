const KEY = 'five-eyes-learner-id';

/** Returns the server-issued learnerId stored after identify, or null if not yet identified. */
export function getLearnerId(): string | null {
  return localStorage.getItem(KEY);
}

/** Store a server-issued learnerId. */
export function setLearnerId(id: string): void {
  localStorage.setItem(KEY, id);
}

/** Clear stored identity (switch learner / logout). */
export function clearLearnerId(): void {
  localStorage.removeItem(KEY);
}
