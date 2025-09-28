---
description: Technical architecture and engineering choices for kaleening
globs:
  - aws/**
  - mobile/**
alwaysApply: true
---

## Technical Architecture & Choices

### Overview
- **Backend**: AWS CDK (TypeScript) provisioning a Python Lambda, API Gateway, Cognito, DynamoDB, SSM Parameters, and Lambda Layers.
- **Mobile**: React Native + Expo Router + NativeWind. State via Zustand. Auth via AWS Cognito (v3 SDK). Theming via custom tokens and runtime styles.

### AWS (Backend)
- **IaC**: AWS CDK in TypeScript under `aws/src/**`.
- **Data**: Single DynamoDB table (`pk`, `sk`, TTL), on-demand billing.
- **Compute**: Single Python 3.12 Lambda at `aws/src/fn/api/app.py`.
- **API**: API Gateway (Regional), proxy to Lambda, CORS wide-open for now (to be tightened).
- **Auth**: Cognito User Pool + App Client (no secret), SRP and password auth flows, email verification.
- **Layers**:
  - Common layer (Python) referenced via SSM.
  - AWS Lambda Powertools layer referenced via SSM.
- **Config**: SSM parameters for table name, common layer ARN, powertools layer ARN.
- **Logging**: Log group per Lambda with 2-week retention; Powertools `Logger` in `aws/src/shared/logger.py`.

### Mobile (Frontend)
- **Framework**: Expo (React Native). Routing via Expo Router in `mobile/src/app/**` with entry `mobile/src/app/index.tsx`.
- **Styling**: NativeWind for layout/typography utilities; backgrounds and colors via React Native `style` using theme tokens (see rule: `nativewind-background`). Tailwind config uses NativeWind preset and extends spacing/radius and fonts.
- **Theming**: `mobile/src/styles/buildTheme.ts` exports semantic tokens (surface/content/border/status/interactive) with light/dark support and raw palettes. Use `useTheme()` to access `colors`.
- **State**: Zustand (persisted with AsyncStorage) in `mobile/src/stores/**`.
- **Auth**: Custom wrapper `CognitoAuth` using `@aws-sdk/client-cognito-identity-provider`. Tokens and user state are managed in an internal store with helpers for login, sign up, refresh, update attributes.
- **Env Config**: Expo public env vars used at runtime (e.g., `EXPO_PUBLIC_CDK_AWS_REGION`, `EXPO_PUBLIC_APP_CLIENT_ID`). Missing vars are warned early in the auth store.
- **Bundler**: Metro configured with NativeWind CSS input. Babel uses `babel-preset-expo` and `nativewind/babel`.

### Conventions & Guidelines
- **Backgrounds**: No Tailwind `bg-*` classes. Use theme tokens with `style`/`StyleSheet`. See `nativewind-background` rule.
- **API calls**: Go through the Lambda/API Gateway; secure endpoints with Cognito auth headers once API routes are added.
- **Data modeling**: Use single-table design in DynamoDB with composite keys (`pk`, `sk`).
- **Error handling**: Prefer domain-specific errors (e.g., `AuthError`, `ValidationError` on mobile) and Powertools `Logger` on backend.
- **Accessibility**: Maintain high contrast per theme tokens; ensure focus/pressed states via `interactive` tokens.

### Roadmap Hooks
- **Appointments & Mosques**: Model entities in DynamoDB; expose CRUD endpoints via API Gateway; authorize via Cognito JWT.
- **Admin features**: Admin-protected routes/actions; consider groups/roles in Cognito or custom authorizer logic.
- **CORS tightening**: Replace wildcard CORS with explicit origins.

### References
- AWS CDK stacks: `aws/src/Common.ts`, `aws/src/Api.ts`
- Lambda entry: `aws/src/fn/api/app.py`
- Shared backend utilities: `aws/src/shared/**`
- Theme and styles: `mobile/src/styles/**`
- Auth client: `mobile/src/services/auth/cognito.ts`
- Auth store: `mobile/src/stores/authStore.ts`
- Tailwind + NativeWind: `mobile/tailwind.config.js`, `mobile/metro.config.js`, `mobile/babel.config.js`
