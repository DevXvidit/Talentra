# Coding Guidelines

1. **Constants over Inline Definitions**: Whenever we have configuration objects, arrays of data (like slides, tabs, etc.), or specific reusable values, define them as constants in a dedicated file (e.g., `src/constants/`) rather than declaring them inline inside the component.
2. **State Management for APIs**: Always use the state management store (e.g., Zustand) for data fetching and API calls instead of making direct `axios` or `fetch` calls from within the React components.
3. **No Inline Comments**: Do not add inline comments (like `//` or `/* */`) to the codebase. Code should be clean and self-documenting.
4. **Global Image Imports**: When importing images using `require(...)`, define them centrally in a single global constants file (e.g., `src/constants/images.ts`) and import them from there throughout the app. Do not use inline `require()` calls for assets.
