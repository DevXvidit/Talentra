# Architecture - Talentra

## Directory Structure
- `src/components`: Shared UI components (Component-per-Folder).
- `src/screens`: Main screen components (Component-per-Folder).
- `src/store`: Zustand stores (`authStore.ts`, `jobStore.ts`, etc.).
- `src/queries`: TanStack Query hooks (`useJobs.ts`, `useProfile.ts`, `useApplications.ts`).
- `src/navigation`: Navigation container, bottom tabs, and stack definitions.
- `src/services`: Native services (Google Sign-In, etc.).
- `src/theme`: Theme constants (colors, fonts, sizes).
- `src/utils`: Helper functions, constants, and validation schemas.

## 📁 Folder Architecture (Component-per-Folder)
Every major UI component and screen MUST follow the modular folder pattern:
- `index.ts`: Entry point using: `export { default } from './Name';`
- `Name.tsx`: The main component logic and JSX.
- `Name.styles.ts`: Separated stylesheet definitions or styling utility helpers.

**Example:**
```
OnboardingScreen/
  ├── index.ts
  ├── OnboardingScreen.tsx
  └── OnboardingScreen.styles.ts
```

## Data Management
- **Global State**: Managed via **Zustand**. Used for Auth session tokens, roles selection, push token state, and local UI state.
- **Server State**: Managed via **TanStack Query**. Handles caching, fetching, search pagination state, bookmarks caching, and mutations.
- **Form State**: Managed via **React Hook Form** with **Zod** schema validations (used heavily on S2 Login/Register and S5 Post a Job forms).

## Styling
- **NativeWind**: Tailwind CSS for React Native. Styles are applied via `className` properties. Custom tailwind styles or specific helper stylesheets reside in `.styles.ts` files when clean separation is desired.
