import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { getSessionToken } from '../lib/session';

export type LearnerTier = 'free' | 'individual' | 'professional' | 'paid' | null; // null = not authenticated

let cached: LearnerTier | undefined;

function doFetch(
  setTier: (t: LearnerTier) => void,
  setLoading: (b: boolean) => void,
): void {
  const token = getSessionToken();
  if (!token) {
    cached = null;
    setTier(null);
    setLoading(false);
    return;
  }
  setLoading(true);
  api.access
    .getTier()
    .then(res => {
      cached = res.tier as LearnerTier;
      setTier(res.tier as LearnerTier);
    })
    .catch(() => {
      cached = null;
      setTier(null);
    })
    .finally(() => setLoading(false));
}

export function useLearnerTier(): { tier: LearnerTier; loading: boolean; refresh: () => void } {
  const [tier, setTier] = useState<LearnerTier>(cached ?? null);
  const [loading, setLoading] = useState(cached === undefined);

  useEffect(() => {
    if (cached !== undefined) return;
    doFetch(setTier, setLoading);
  }, []);

  function refresh() {
    cached = undefined;
    doFetch(setTier, setLoading);
  }

  return { tier, loading, refresh };
}

/** Call this on logout to reset the cached tier. */
export function clearTierCache(): void {
  cached = undefined;
}

/** Returns true if the tier has TTX access (professional, paid, or higher). */
export function hasTtxAccess(tier: LearnerTier): boolean {
  return tier === 'professional' || tier === 'paid';
}
