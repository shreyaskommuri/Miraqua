export type RootStackParamList = {
  SignIn: undefined;
  MainTabs: { screen?: keyof MainTabParamList; params?: any };
  PlotDetails: { plot: any };
  FarmerChat: { plot: any };
  WeatherForecast: undefined;
  PickLocation: undefined; // 👈 New screen
};

export type MainTabParamList = {
  Home: undefined;
  'Add Plot': { lat?: number; lon?: number }; // 👈 Add params here
  Account: undefined;
};
