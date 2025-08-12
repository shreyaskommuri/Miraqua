
const environment = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  apiUrl: 'https://api.miraqua.app/v1',
  websocketUrl: 'wss://ws.miraqua.app',
  enableLogging: import.meta.env.MODE === 'development'
};

export { environment };
