# Separation of Concerns - Athletes vs Company

## Architecture Decision

**Complete Separation:**
- **Athletes** = Separate app/system (fitness users)
- **Company/Founder** = Separate app/system (company tooling)
- **Shared Backend** = Both use same backend API (for now)

## Identity Models

### Athlete App
- Different Firebase project
- Different login flow
- Pure fitness users
- Garmin integration, activities, RunCrews
- **NO founderId link** - completely separate

### Company/Founder App
- Different Firebase project
- Different login flow
- Company tooling (tasks, CRM, roadmaps, finances)
- **Standalone identities** - not linked to athletes
- Can reference athlete context but not required

## Schema Changes Needed

### Current State
```prisma
model Founder {
  id        String @id @default(cuid())
  athleteId String @unique // ❌ Remove this - separation of concerns
  // ...
}
```

### Target State
```prisma
model Founder {
  id        String @id @default(cuid())
  email     String @unique // Standalone identity
  name      String
  // NO athleteId - completely separate
  // ...
}
```

### Company Model
```prisma
model Company {
  id        String @id @default(cuid())
  name      String
  // Standalone - no athlete links
  // ...
}
```

## Upsert Usage

**Still useful for:**
- Creating standalone Founder identities
- Creating standalone Company entities
- Bulk company identity creation

**Not for:**
- Linking athletes to founders (that relationship is removed)
- Creating athlete-linked company profiles

## Migration Path

1. **Remove `athleteId` from Founder model**
   - Make Founder standalone (email-based identity)
   - Update all Founder endpoints to not require athleteId

2. **Keep shared backend**
   - Same API server
   - Different Firebase projects per app
   - Different auth flows

3. **Separate frontend apps**
   - `gofast-athlete-app` (fitness users)
   - `gofast-company-app` (company tooling)
   - `gofast-user-dashboard` (admin tool for both)

## Admin Dashboard

The dashboard can still manage both:
- Athletes (from athlete app)
- Founders/Company (from company app)
- But they're completely separate identities

## Benefits

1. **Clear separation** - No confusion about athlete vs company
2. **Independent scaling** - Each app can scale separately
3. **Different auth** - Different Firebase projects, different security
4. **Shared backend** - Reuse API logic, database, etc.
5. **Cleaner codebase** - No mixing of concerns




