export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: { screen?: keyof MainTabParamList; params?: any };
  PlotDetails: { plot: any };
  FarmerChat: { plot: any };
  WeatherForecast: undefined;
  PickLocation: undefined;
  SpecificDay: {
    plotId: string;
    dayData: any;
    dayIndex: number;
  };
  PlotSettings: { plot: any }; // ✅ Add this line
};



export type MainTabParamList = {
  Home: undefined;
  'Add Plot': { lat?: number; lon?: number }; // 👈 Add params here
  Account: undefined;
};
