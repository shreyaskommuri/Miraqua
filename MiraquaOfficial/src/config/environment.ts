
const environment = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  apiUrl: 'https://api.miraqua.app/v1',
  websocketUrl: 'wss://ws.miraqua.app',
  enableLogging: __DEV__
};

export { environment };
