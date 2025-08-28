
const environment = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  apiUrl: __DEV__ ? 'http://localhost:5050' : 'https://api.miraqua.app/v1',
  websocketUrl: __DEV__ ? 'ws://localhost:5050' : 'wss://ws.miraqua.app',
  enableLogging: __DEV__
};

export { environment };
