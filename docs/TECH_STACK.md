# Tech Stack - Talentra (Frontend)

| Purpose      | Library               |
| ------------ | --------------------- |
| API Fetching | TanStack Query (@tanstack/react-query) |
| Global State | Zustand               |
| Forms        | React Hook Form       |
| Validation   | Zod                   |
| API Client   | Axios / Talentra REST API |
| Navigation   | React Navigation      |
| Storage      | react-native-mmkv     |
| Animations   | Reanimated + Moti     |
| UI Framework | NativeWind (Tailwind) |
| Debugging    | Reactotron            |

## Core Engine
- **Framework**: React Native CLI
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Icons**: Lucide React Native
- **Single Sign-On**: Google Sign-in SDK (@react-native-google-signin/google-signin)
- **Media Uploads**: Document Picker / Image Picker uploaded via Axios multipart payloads to Firebase Storage through the Talentra Backend
