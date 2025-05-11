// navigation/types.ts
export type RootStackParamList = {
  SignIn: undefined;
  MainTabs: undefined;
  PlotDetails: { plot: any };
  FarmerChat: { plot: any };
};

export type MainTabParamList = {
  Home: undefined;
  'Add Plot': undefined;
  Account: undefined;
};
