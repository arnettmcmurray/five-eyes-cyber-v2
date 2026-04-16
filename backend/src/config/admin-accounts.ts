export interface SeedAdminAccount {
  username: string;
  isTopAdmin?: boolean;
  isBreakGlass?: boolean;
}

export const SEEDED_ADMIN_ACCOUNTS: SeedAdminAccount[] = [
  { username: 'darren', isTopAdmin: true },
  { username: 'michaelm@fiveyesltd.com' },
  { username: 'dmott@fiveyesltd.com' },
  { username: 'support@fiveyesltd.com' },
  { username: 'platform-recovery', isBreakGlass: true },
];

export const CANONICAL_TOP_ADMIN_USERNAME =
  SEEDED_ADMIN_ACCOUNTS.find((account) => account.isTopAdmin)?.username ?? 'darren';

export const BREAK_GLASS_ADMIN_USERNAME =
  SEEDED_ADMIN_ACCOUNTS.find((account) => account.isBreakGlass)?.username ?? 'platform-recovery';

export const LEGACY_ADMIN_USERNAMES_TO_REMOVE = [
  'arnettmcmurray@gmail.com',
];
