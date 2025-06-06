// navigation/types.ts
export type RootStackParamList = {
  SignIn: undefined;
  MainTabs: undefined;
  PlotDetails: { plot: any };
  FarmerChat: { plot: any };
  WeatherForecast: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  'Add Plot': undefined;
  Account: undefined;
};
