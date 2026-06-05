# Debugging - Talentra

This project uses **Reactotron** for real-time inspection of state, network requests, and logs.

## 1. Setup
1. Download and install the [Reactotron Desktop App](https://github.com/infinitered/reactotron/releases).
2. Ensure your mobile device/emulator is on the same local network as your computer.
3. For Android, run:
   ```sh
   adb reverse tcp:9090 tcp:9090
   ```

## 2. Configuration
The debugger is configured in `ReactotronConfig.ts`. It is only enabled in `__DEV__` mode and should not be imported in production builds.

## 3. Features
- **Global State**: Inspect Zustand store transitions (`authStore`, `jobStore`, etc.).
- **API Traffic**: Monitor TanStack Query requests and responses targeting the backend REST endpoints.
- **Custom Logs**: Use `console.tron.log()` for formatted data inspection.
- **Async Storage**: View key-value items saved within `react-native-mmkv`.

## 4. Troubleshooting
- If Reactotron doesn't connect immediately, restart the Metro bundler.
- Ensure the IP address in `ReactotronConfig.ts` matches your machine's local IP if you are testing on a physical iOS or Android device.
