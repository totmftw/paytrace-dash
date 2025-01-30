export const ROLES = [
  "business_owner",
  "business_manager",
  "order_manager",
  "it_admin",
  "team_member"
] as const;

export type Role = typeof ROLES[number];