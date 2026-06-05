# Screen Details - Talentra

Each screen is designed for maximum clarity, ease of use, and a premium visual aesthetic.

## 🛠️ Implementation Standards
Every screen MUST follow these rules:
- **Component-per-Folder**: Each screen gets its own folder in `src/screens/`.
- **Logic-Style Separation**: Move all custom `StyleSheet.create` or heavy layout configurations to a `.styles.ts` file within the folder.
- **Shorthand Export**: Use `export { default } from './ScreenName'` in the folder's `index.ts`.
- **Naming**: Use PascalCase for both folders and files.

---

## S1: Onboarding
- **Purpose**: Welcoming users and identifying their role to shape the navigation ecosystem.
- **Features**:
  - **3-Slide Carousel**: Fluid sliding intro with animated illustrations, custom descriptions, and page dot-indicators.
  - **Role Selector**: Segmented layout option to select either "Candidate" or "Recruiter". Uses active visual states (color highlights, smooth scaling) to emphasize selection.
  - **CTA Button**: Custom transition to next stack (S2: Login / Register).

---

## S2: Login / Register
- **Purpose**: Authenticate user session using JWT and local secure storage.
- **Features**:
  - Segmented control to switch between "Sign In" and "Sign Up".
  - Modern form handling via React Hook Form, featuring custom input designs, floating labels, password visibility toggle, and error states.
  - **Google Sign-In Button**: Triggers standard Google client verification and sends the ID token to the backend.
  - **Secure Token Storage**: The resulting JWT is stored locally inside highly secure MMKV storage to maintain session persistent state across app restarts.

---

## S3: Home - Job Feed
- **Purpose**: Provide candidates with a paginated, filterable feed of active listings (or a recruiter's specific dashboard of posted jobs).
- **Features**:
  - **Keyword Search Bar**: Searches titles, descriptions, and locations via standard text index filters.
  - **Category Horizontal Chip List**: Enables quick filtering by "Engineering", "Design", "Product", etc.
  - **Job Type Selectors**: Custom multi-select chips filter by Full-time, Part-time, Contract, Remote, or Internship.
  - **Paginated Listing**: Pulls paginated jobs from the REST endpoint with "Pull to Refresh" and "Infinite Scroll" loading states.

---

## S4: Job Detail
- **Purpose**: Display rich information for a single job listing and handle interactive tasks (bookmark, apply).
- **Features**:
  - **Rich Job Info Card**: Detailed views for title, location, salary, category, company info, and long-form markdown descriptions.
  - **Bookmark Icon Toggle**: Toggle job bookmark status with haptic feedback. Syncs in the background via TanStack Query mutation (`POST /api/v1/jobs/:id/bookmark`).
  - **Apply Button**: Candidate upload option to attach their resume (PDF/DOCX) using a document picker, submitting via multipart-form uploads.

---

## S5: Post a Job
- **Purpose**: Allows recruiters to create and publish a new job listing on the platform.
- **Features**:
  - **Comprehensive Form**: Inputs for title, description (supporting markdown hints), location, salary, category select, and job type select.
  - **Zod Schema Validation**: Client-side validation ensuring all mandatory details are provided and formatted properly.
  - **Submission feedback**: Displays loading overlay and success banner upon successful job creation, reloading S3.

---

## S6: Saved Jobs
- **Purpose**: Personal portfolio where candidates view their saved/bookmarked listings.
- **Features**:
  - **Quick Listing View**: Displays cards of all bookmarked jobs.
  - **Remove from Saved**: Swipe action or quick bookmark toggle to unsave listings immediately, triggering an optimistic UI update.

---

## S7: Profile
- **Purpose**: Manage account configurations and upload avatars.
- **Features**:
  - **Avatar Upload**: Interactive avatar selection (using image picker). Uploads profile photo to Firebase Storage via backend `PATCH /api/v1/users/profile`.
  - **Name Update**: Text inputs to edit display name.
  - **Logout CTA**: Clears local MMKV token, resets Zustand global state, and navigates back to S2.
