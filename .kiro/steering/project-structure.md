---
description: High-level map of the repo to orient assistants and tools
globs:
  - aws/**
  - mobile/**
alwaysApply: true
---

## Project Structure

The project is organized into the following directories:

- `aws/`: This contains the AWS CDK code for the project that builds the backend infrastructure.
- `mobile/`: This contains the React Native code for the project that builds the mobile app.


## AWS

AWS is the backend for the project. It is organized into the following way:

1. `src/Common.ts`: CDK for common resources shared across stacks. Includes:
    - DynamoDB table
    - Common Lambda layer
    - SSM parameters
2. `src/Api.ts`: CDK for the API stack. Provisions:
    - Lambda function (entry implemented in `aws/src/fn/api/app.py`)
    - API Gateway routing to the Lambda
    - Cognito authentication for the API
3. `src/shared/`: Python shared utilities for Lambda functions (e.g., `logger.py`, `lambda_response.py`).
4. `src/fn/`: Lambda function sources, including `api/`.

## Mobile

Mobile is the frontend for the project (React Native + Expo Router). It is organized into the following way:

1. `src/app/`: App routes and screens (Expo Router). Entry point: `src/app/index.tsx`.
2. `src/components/`: Reusable UI components.
3. `src/contexts/`: React context providers.
4. `src/hooks/`: Custom hooks (e.g., `useTheme`).
5. `src/screens/`: Screen-level components not tied to routes (legacy or grouped views).
6. `src/services/`: Service modules (e.g., auth, API clients).
7. `src/stores/`: State management (e.g., Zustand stores).
8. `src/styles/`: Theme, tokens, and NativeWind setup.
9. `src/types/`: Shared TypeScript types.


### src/app/

The Frontend for the mobile app is built using React Native and Expo. The entry point for the app is the `src/app/index.tsx` file.