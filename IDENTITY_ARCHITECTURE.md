# Identity Architecture - Athlete vs Company

## Core Principle
**You're either an Athlete OR a Company person - these are separate concerns.**

## Identity Types

### 1. Athlete
- Real users using the app for fitness/training
- Primary identity: `Athlete` model
- Has activities, Garmin integration, RunCrew membership
- Core user type for the fitness platform

### 2. Company Person
- Company employees, founders, team members
- NOT athletes (separate concern)
- Has access to company tools (CRM, roadmaps, tasks)
- Identity types: `Founder`, `Company`

## Model Relationships

### Athlete (Pure Athlete Identity)
```
Athlete
  ├── AthleteActivity (linked via athleteId)
  ├── RunCrewMembership (linked via athleteId)
  └── GarminIntegration (linked via athleteId)
```

### Company Person (Company Identity)
```
Company/Founder
  ├── Company (if company employee)
  └── Founder (if founder)
  └── (No athlete activities - separate concern)
```

## Upsert Strategy

### For Athletes
- Don't upsert company models to athletes
- Athletes stay as athletes

### For Company People
- Create Founder or Company records
- These are separate from athlete identity
- May or may not have athlete profile (depends on use case)

## Admin Dashboard Usage

**Current Wizard Behavior:**
- Allows adding Founder/Company to athletes
- **BUT:** This is for when an athlete user also needs company access
- **OR:** For creating company-only users (separate from athletes)

**Recommendation:**
- Consider separate user creation flows:
  - Create Athlete → for fitness users
  - Create Company User → for company folks (maybe with optional athlete link)

## Questions to Clarify

1. Can someone be BOTH an athlete AND a company person?
   - If yes: Keep current upsert approach
   - If no: Separate creation flows

2. Do company people have athlete profiles?
   - Founders might also be athletes
   - Or company people are purely company-side

3. What is "Company" model?
   - Is this a separate user type?
   - Or is it just "company employees" who can be linked to Founder?

## Current Implementation

The upsert wizard currently supports:
- ✅ Founder (company person)
- ✅ Company (company person)
- ❌ Investor, Coach (removed - were athlete roles)

This reflects: **You're either an Athlete OR a Company person.**




