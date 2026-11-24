export const ROLES = ["member", "admin", "auditor", "support"] as const;
export type Role = (typeof ROLES)[number];

/** Role-based access control matrix. Keep this the single source of truth. */
export const PERMISSIONS = {
  "member:dashboard": ["member", "admin", "auditor", "support"],
  "admin:view": ["admin", "auditor", "support"],
  "admin:finance": ["admin", "auditor"],
  "admin:members": ["admin", "auditor", "support"],
  "admin:risk": ["admin", "auditor"],
  "admin:audit": ["admin", "auditor"],
  "admin:support": ["admin", "support"],
  "admin:support:write": ["admin", "support"],
  "admin:waitlist": ["admin", "auditor", "support"],
  "admin:referrals": ["admin", "auditor", "support"],
  "admin:referrals:write": ["admin"],
  "admin:referral-config": ["admin", "auditor"],
  "admin:referral-config:write": ["admin"],
  "admin:rewards": ["admin", "auditor"],
  "admin:rewards:write": ["admin"],
  "admin:campaigns": ["admin", "support"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined | null, perm: Permission): boolean {
  return !!role && (PERMISSIONS[perm] as readonly Role[]).includes(role);
}
