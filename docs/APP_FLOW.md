# App Flow - Talentra

## 1. Initial Launch (Splash/Bootstrap)
- Check if a secure JWT token exists in MMKV storage.
- If a valid token exists: Retrieve user info and navigate to `MainApp` (Bottom Tabs Navigation).
- If no token exists: Navigate to `AuthStack` starting with `Onboarding` (S1).

## 2. Onboarding Flow (S1)
- **3-Slide Intro**: Walk through product value propositions (Find Jobs, Apply Easily, Hire Talents).
- **Role Selection**: Select whether the user is a `Candidate` or `Recruiter`. Save selection in local state.
- **Get Started**: Navigate to S2 (Login / Register).

## 3. Authentication Flow (S2)
- **Email/Password Signup**: Enter name, email, password, and confirm role. Call API on success, store JWT in MMKV, and navigate to main workspace.
- **Email/Password Login**: Authenticate with credentials. Store JWT in MMKV, load profile, and navigate.
- **Google OAuth**: Authenticate via Google SDK, request Google ID Token, verify with backend. (If new user, require role select). On success, store JWT in MMKV, load profile, and navigate.

## 4. Main Navigation (Bottom Tabs)
The bottom navigation bar has different tabs depending on the authenticated user's role:
- **Candidate Stack**:
  - **Job Feed (Home) (S3)**: Explore jobs list, search, and category filters.
  - **Saved Jobs (S6)**: Browse saved bookmarks, quick unsave.
  - **Profile (S7)**: Edit details, upload avatar, log out.
- **Recruiter Stack**:
  - **Job Feed (Home) (S3)**: List of jobs posted by this recruiter (with quick status/applicants count if desired).
  - **Post a Job (S5)**: Form to publish new listings.
  - **Profile (S7)**: Edit company/recruiter details, upload avatar, log out.

## 5. Job Operations (S3 & S4)
- **Search & Filter (S3)**: Enter keyword query (searches title, description, and location), select category chip, or choose job type. Pulls paginated data from backend.
- **Job Detail (S4)**: Tapping any job card opens the detail page displaying comprehensive information.
  - **Save Bookmark**: Candidate toggles bookmarks (syncs with database bookmarks, updates S6).
  - **Apply**: Candidate clicks "Apply", attaches resume (PDF/DOCX), uploads via multipart to Firebase Storage through the backend, and submits application.

## 6. Profile & Settings (S7)
- View current details and avatar.
- Edit Name or select a new image. On save, upload image to Firebase Storage via backend `PATCH /api/v1/users/profile`, update local profile state.
- **Logout**: Wipe JWT from MMKV, clear global Zustand state, and reset navigation to S2 (Login).
