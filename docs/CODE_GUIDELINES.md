# Code Guidelines - Talentra

## 1. Directory & File Structure
- **Components/Screens**: Follow the **Component-per-Folder** pattern:
  - `src/components/Name/Name.tsx`
  - `src/components/Name/Name.styles.ts`
  - `src/components/Name/index.ts` (Shorthand export only)
- **Constants**: Store all shared strings/routes in `src/constants/index.ts` (or subfiles like `screens.ts`, `jobTypes.ts`).
- **Naming**: 
  - PascalCase for Folders and Component Files.
  - camelCase for styles, stores, queries, and utilities.
- **Language**: Use **Standard English** for all code, comments, and documentation. No other languages or scripts allowed.

## 2. File Organization (Strict Sequence)
Maintain this order in every file:
1. **Imports**: Library imports first, then internal project imports.
2. **Types/Interfaces**: Define Props and local types.
3. **Constants**: Define local constants (if not in a separate file).
4. **Component Definition**: Use arrow functions.
5. **Hooks Block**:
   - Zustand stores (`useAuthStore`, `useJobStore`, etc.).
   - TanStack Queries/Mutations (`useJobs`, `useBookmarkMutation`, etc.).
   - React local state (`useState`, `useRef`).
   - Effect Hooks (`useEffect` grouped together).
6. **Functions Block**: Group all helper functions and event handlers (e.g., `handlePress`).
7. **Main Render**: The return statement.
8. **Styles**: NativeWind classes or `StyleSheet.create` at the very bottom.

## 3. Spacing & Formatting
- **Two blank lines** between major logical sections (e.g., between Hooks and Functions).
- **One blank line** between individual hooks or functions.
- Destructure props in the component argument.

## 4. Naming Conventions
- **Functions**:
  - Event Handlers: `handle[Action]` (e.g., `handlePress`, `handleApply`, `handleSave`).
  - Data: `fetch[Data]`, `get[Value]`, `update[Data]`.
- **Booleans**: Use prefixes like `is`, `has`, `should` (e.g., `isLoading`, `hasError`, `isBookmarked`).

## 5. Magic Strings & Constants (Mandatory for Shared Values)
- **Mandatory Constants**: ALWAYS use constants for:
  - **Routes**: Navigation screen names (e.g., `ROUTES.JOB_FEED`, `ROUTES.POST_JOB`).
  - **Job Types**: Job classifications (e.g., `JOB_TYPES.FULL_TIME`, `JOB_TYPES.REMOTE`).
  - **Shared Labels**: Any string used in multiple places or for logical checks.
- **Optional**: Internal component strings that are unique and never reused do not require constants.
- **Location**: Use `src/constants/screens.ts` for routes and navigation names, and `src/constants/jobs.ts` for job types and categories.

## 6. UI & Data Management
- **NativeWind**: Use Tailwind classes via `className`. Use `styled()` for reanimated components.
- **TanStack Query**: Always handle `isLoading` and `isError` states.
- **Forms**: Use `Controller` from React Hook Form + Zod validation schemas.
- **Touch Targets**: Minimum 44x44pt area for all interactive elements. Use `hitSlop` where needed.
