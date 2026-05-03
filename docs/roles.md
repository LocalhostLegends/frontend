# Centralized role management

> **Code (source of truth):** `src/app/core/constants/roles.constants.ts`, `routes.constants.ts`, `menu.constants.ts`  
> This page is the maintained description for developers. It used to live as `ROLES_README.md` next to the constants.

## Overview

All role definitions, access control, and role-dependent behavior are defined in one place so changes stay simple and consistent.

## Single source of truth

### `roles.constants.ts`

- **UserRole** — union of all roles
- **ROLES_CONFIG** — label, description, and metadata per role
- **Helper functions** — checks and permission helpers

## Available roles

```typescript
type UserRole = 'super_admin' | 'admin' | 'manager' | 'hr' | 'employee';
```

| Role | Level | Description |
|------|-------|-------------|
| SUPER_ADMIN | 5 | Developer access — companies and system settings |
| ADMIN | 4 | Company owner — full company access |
| HR | 3 | HR — employees and invites |
| MANAGER | 2 | Department head — department and team |
| EMPLOYEE | 1 | Basic — own profile and limited info |

## Helper functions (examples)

**Labels and lists**

- `getRoleLabel(role)` — display name
- `getAllRoles()` — all role values
- `getRegistrationRoles()` — roles allowed at registration (excludes `super_admin`)

**Invites and hierarchy**

- `getInvitableRoles(requesterRole)` — who this role may invite
- `getDefaultInviteRole(requesterRole)` — default invite role
- `canManageRole(managerRole, targetRole)` — hierarchy check
- `hasRoleAccess(role, requiredRoles)` — membership in a set

**Feature flags**

- `canSeeOrganizationData(role)` — users/invites visibility
- `canManageDepartments(role)` — departments
- `isAdminRole(role)` — admin or super_admin
- `isHrRole(role)` — HR

## Route access

**File:** `src/app/core/constants/routes.constants.ts`  
**Export:** `ROUTE_ACCESS` — map route prefix → allowed roles.

Used with `roleGuard` and `data: { roles: ROUTE_ACCESS['/app/...'] }` in `app.routes.ts`.

## Menu configuration

**File:** `src/app/core/constants/menu.constants.ts`  
**Export:** `MENU_BY_ROLE` — sidebar items per role.

## Practices

**Prefer**

- Helpers (`isAdminRole`, `canSeeOrganizationData`, …) instead of raw string compares
- Imports from `roles.constants.ts`
- `ROUTE_ACCESS` in routing — not ad-hoc role arrays in guards

**Avoid**

- `role === 'admin'` scattered in templates/components
- Duplicated role lists per component
- Hardcoded role arrays in guards (use `ROUTE_ACCESS`)

## Adding or changing a role

1. Extend `UserRole` and `ROLES_CONFIG` in `roles.constants.ts`
2. Adjust `getInvitableRoles` / `getDefaultInviteRole` if needed
3. Update `menu.constants.ts` and `routes.constants.ts`
4. Update any feature-specific helpers

## File reference

```
src/app/core/constants/
├── roles.constants.ts    # Roles and helpers
├── menu.constants.ts     # Sidebar per role
└── routes.constants.ts   # Route access per role
```

---

**Last updated:** April 30, 2026
