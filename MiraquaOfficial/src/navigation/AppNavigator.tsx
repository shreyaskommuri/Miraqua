import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Index from '../pages/Index';
import PlotDetailsScreen from '../components/screens/PlotDetailsScreen';
import AddPlotScreen from '../components/screens/AddPlotScreen';
import WeatherForecastScreen from '../components/screens/WeatherForecastScreen';
import AccountScreen from '../components/screens/AccountScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} />
        <Stack.Screen name="AddPlot" component={AddPlotScreen} />
        <Stack.Screen name="WeatherForecast" component={WeatherForecastScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 