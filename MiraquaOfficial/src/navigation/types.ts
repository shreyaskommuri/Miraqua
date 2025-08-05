export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  PlotDetails: { plot: any };
  Weather: undefined;
  Account: undefined;
  Chat: undefined;
  Plots: undefined;
  PlotSettings: { plotId?: string };
  SpecificDay: { plotId?: number; day?: string; date?: string };
  Marketplace: undefined;
  Analytics: undefined;
  Reports: undefined;
  ExportReports: undefined;
  PredictiveDashboard: undefined;
  AnomalyAlerts: undefined;
  PlantHealthScanner: undefined;
  YieldForecast: undefined;
  SmartMap: undefined;
  Community: undefined;
  SetupPlot: undefined;
  OnboardingLocation: { plotName?: string; selectedCrop?: string; cropDetails?: any };
  OnboardingComplete: { plotName?: string; selectedCrop?: string; cropDetails?: any; latitude?: number; longitude?: number; address?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Plots: undefined;
  Weather: undefined;
  Account: undefined;
}; 