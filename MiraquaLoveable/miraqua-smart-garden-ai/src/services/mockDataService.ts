
// Mock data service to provide consistent data across the application
export interface Plot {
  id: string;
  name: string;
  crop: string;
  variety?: string;
  location: string;
  currentTemp: number;
  currentMoisture: number;
  currentSunlight: number;
  healthScore: number;
  nextWatering: string;
  lastWatered: string;
  isOnline: boolean;
  coordinates: {
    lat: number;
    lon: number;
  };
  area: number;
  plantingDate: string;
  expectedHarvest: string;
  soilType: string;
  irrigationMethod: string;
}

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    icon: string;
  }>;
}

export interface SensorReading {
  id: string;
  plotId: string;
  type: 'moisture' | 'temperature' | 'ph' | 'light';
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface Device {
  id: string;
  name: string;
  type: 'valve' | 'pump' | 'sensor';
  plotId: string;
  status: 'online' | 'offline' | 'maintenance';
  batteryLevel?: number;
  lastSeen: string;
}

// Mock data
const mockPlots: Plot[] = [
  {
    id: "1",
    name: "Cherry Tomato Garden",
    crop: "Cherry Tomatoes",
    variety: "Sweet 100",
    location: "Backyard Plot A",
    currentTemp: 72,
    currentMoisture: 68,
    currentSunlight: 85,
    healthScore: 87,
    nextWatering: "Tomorrow 6:00 AM",
    lastWatered: "2 hours ago",
    isOnline: true,
    coordinates: { lat: 37.7749, lon: -122.4194 },
    area: 25,
    plantingDate: "2024-03-15",
    expectedHarvest: "2024-07-15",
    soilType: "Loamy",
    irrigationMethod: "Drip"
  },
  {
    id: "2", 
    name: "Herb Garden",
    crop: "Mixed Herbs",
    variety: "Basil & Rosemary",
    location: "Kitchen Window",
    currentTemp: 70,
    currentMoisture: 55,
    currentSunlight: 92,
    healthScore: 92,
    nextWatering: "Today 8:00 PM",
    lastWatered: "6 hours ago",
    isOnline: true,
    coordinates: { lat: 37.7849, lon: -122.4094 },
    area: 8,
    plantingDate: "2024-02-20",
    expectedHarvest: "2024-06-20",
    soilType: "Sandy",
    irrigationMethod: "Sprinkler"
  },
  {
    id: "3",
    name: "Pepper Patch",
    crop: "Bell Peppers",
    variety: "California Wonder",
    location: "Side Garden",
    currentTemp: 75,
    currentMoisture: 42,
    currentSunlight: 78,
    healthScore: 73,
    nextWatering: "In 2 hours",
    lastWatered: "1 day ago",
    isOnline: false,
    coordinates: { lat: 37.7649, lon: -122.4294 },
    area: 18,
    plantingDate: "2024-04-01",
    expectedHarvest: "2024-08-01",
    soilType: "Clay",
    irrigationMethod: "Manual"
  }
];

const mockWeatherData: WeatherData = {
  current: {
    temp: 74,
    humidity: 65,
    windSpeed: 12,
    condition: "Partly Cloudy",
    icon: "partly-cloudy"
  },
  forecast: [
    { date: "Today", high: 76, low: 62, condition: "Sunny", precipitation: 0, icon: "sunny" },
    { date: "Tomorrow", high: 78, low: 64, condition: "Partly Cloudy", precipitation: 10, icon: "partly-cloudy" },
    { date: "Thursday", high: 72, low: 58, condition: "Rain", precipitation: 80, icon: "rain" },
    { date: "Friday", high: 69, low: 55, condition: "Cloudy", precipitation: 20, icon: "cloudy" },
    { date: "Saturday", high: 75, low: 61, condition: "Sunny", precipitation: 0, icon: "sunny" }
  ]
};

// API simulation functions
export const getPlots = async (): Promise<Plot[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockPlots;
};

export const getPlot = async (id: string): Promise<Plot | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPlots.find(plot => plot.id === id) || null;
};

export const getWeatherData = async (plotId?: string): Promise<WeatherData> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockWeatherData;
};

export const getSensorReadings = async (plotId: string): Promise<SensorReading[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      id: "1",
      plotId,
      type: "moisture",
      value: 68,
      unit: "%",
      timestamp: "2024-01-15T10:30:00Z",
      status: "normal"
    },
    {
      id: "2",
      plotId,
      type: "temperature",
      value: 72,
      unit: "°F",
      timestamp: "2024-01-15T10:30:00Z",
      status: "normal"
    },
    {
      id: "3",
      plotId,
      type: "ph",
      value: 6.8,
      unit: "pH",
      timestamp: "2024-01-15T10:30:00Z",
      status: "normal"
    }
  ];
};

export const getDevices = async (): Promise<Device[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: "1",
      name: "Main Valve A",
      type: "valve",
      plotId: "1",
      status: "online",
      lastSeen: "2 minutes ago"
    },
    {
      id: "2",
      name: "Moisture Sensor B",
      type: "sensor",
      plotId: "2",
      status: "online",
      batteryLevel: 85,
      lastSeen: "5 minutes ago"
    },
    {
      id: "3",
      name: "Water Pump C",
      type: "pump",
      plotId: "3",
      status: "offline",
      lastSeen: "2 hours ago"
    }
  ];
};

export const waterPlot = async (plotId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Watering plot operation
  return true;
};

export const updatePlotSettings = async (plotId: string, settings: Partial<Plot>): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // Updating plot settings
  return true;
};
