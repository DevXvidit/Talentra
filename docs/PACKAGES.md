# Packages - Talentra

This document tracks the core dependencies and libraries used in the project, explaining their purpose and integration.

## Core
- **react-native**: Framework for building native apps using React.
- **react-native-mmkv**: High-performance key/value storage. Used for JWT and local profile persistence.
- **react-native-nitro-modules**: Required engine for MMKV v4+ and other high-performance modules.

## State Management
- **zustand**: Lightweight global state management. Used for holding active session details, active role (candidate vs recruiter), and push token references.
- **@tanstack/react-query**: Server-state management (caching, synchronization, and automatic background refetches of the paginated job feed).

## Navigation
- **@react-navigation/native**: Core navigation library.
- **@react-navigation/native-stack**: Stack-based navigation for screen transitions.
- **@react-navigation/bottom-tabs**: Tab-based navigation for main app layout (Home Feed, Saved, Profile).

## Forms & Validation
- **react-hook-form**: Performant and flexible form management.
- **zod**: TypeScript-first schema validation.
- **@hookform/resolvers**: Glue between React Hook Form and Zod validation schemas.

## UI & Styling
- **nativewind**: Tailwind CSS for React Native.
- **lucide-react-native**: Modern, lightweight icon set.
- **moti**: High-level animation library built on top of Reanimated. Used for premium transitions on S1 Onboarding and slide changes.
- **react-native-reanimated**: Low-level animation engine for high-performance transitions.

## Infrastructure & SSO
- **axios**: Promise-based HTTP client for calling the Talentra Express REST API.
- **@react-native-google-signin/google-signin**: Secure Google OAuth SSO login. Handles fetching the `idToken` to be validated by the backend `/api/v1/auth/google` endpoint.

## Dev Tools
- **reactotron-react-native**: Desktop-based debugger for real-time inspection.
- **typescript**: Static type checking for robust development.
