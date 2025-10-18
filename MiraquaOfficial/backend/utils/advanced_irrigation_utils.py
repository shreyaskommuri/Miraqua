"""
Advanced Irrigation Utilities for MiraquaOfficial
Implements scientific irrigation scheduling based on:
- Penman-Monteith ET₀ calculation
- Dynamic crop coefficients (Kc)
- Soil moisture modeling
- Real-time weather data integration
- Farmer-provided data
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import math


class AdvancedIrrigationCalculator:
    """
    Advanced irrigation calculator using scientific methods
    """
    
    def __init__(self):
        # Physical constants
        self.STEFFAN_BOLTZMANN = 4.903e-9  # MJ K-4 m-2 day-1
        self.LATENT_HEAT_VAPORIZATION = 2.45  # MJ kg-1
        self.PSYCHROMETRIC_CONSTANT = 0.665e-3  # kPa K-1
        self.GAS_CONSTANT = 0.287  # kJ kg-1 K-1
        
        # Soil moisture parameters (defaults, can be overridden by farmer data)
        self.SOIL_PARAMS = {
            'clay': {'field_capacity': 0.45, 'wilting_point': 0.25, 'bulk_density': 1.2},
            'loam': {'field_capacity': 0.35, 'wilting_point': 0.15, 'bulk_density': 1.3},
            'sandy': {'field_capacity': 0.25, 'wilting_point': 0.10, 'bulk_density': 1.5},
            'default': {'field_capacity': 0.35, 'wilting_point': 0.15, 'bulk_density': 1.3}
        }
        
        # Crop-specific parameters for dynamic Kc calculation
        self.CROP_PARAMS = {
            'tomato': {
                'base_kc': [0.6, 0.95, 1.15, 0.8],
                'growth_stages': [30, 60, 90, 120],  # days
                'root_depth': [0.2, 0.4, 0.6, 0.8],  # meters
                'sensitivity_temp': 0.02,  # Kc adjustment per °C
                'sensitivity_humidity': 0.01,  # Kc adjustment per % humidity
            },
            'corn': {
                'base_kc': [0.4, 0.9, 1.15, 0.75],
                'growth_stages': [25, 50, 75, 100],
                'root_depth': [0.15, 0.35, 0.55, 0.7],
                'sensitivity_temp': 0.015,
                'sensitivity_humidity': 0.008,
            },
            'wheat': {
                'base_kc': [0.3, 0.8, 1.0, 0.4],
                'growth_stages': [20, 40, 60, 80],
                'root_depth': [0.1, 0.25, 0.4, 0.5],
                'sensitivity_temp': 0.025,
                'sensitivity_humidity': 0.012,
            },
            'lettuce': {
                'base_kc': [0.6, 0.85, 1.0, 0.8],
                'growth_stages': [15, 30, 45, 60],
                'root_depth': [0.1, 0.2, 0.3, 0.35],
                'sensitivity_temp': 0.03,
                'sensitivity_humidity': 0.015,
            },
            'alfalfa': {
                'base_kc': [0.7, 1.0, 1.2, 0.9],
                'growth_stages': [20, 40, 60, 80],
                'root_depth': [0.2, 0.4, 0.6, 0.8],
                'sensitivity_temp': 0.018,
                'sensitivity_humidity': 0.01,
            },
            'almond': {
                'base_kc': [0.4, 0.85, 1.05, 0.85],
                'growth_stages': [30, 60, 90, 120],
                'root_depth': [0.3, 0.6, 0.9, 1.2],
                'sensitivity_temp': 0.02,
                'sensitivity_humidity': 0.01,
            }
        }
    
    def calculate_penman_monteith_et0(self, weather_data: Dict) -> float:
        """
        Calculate reference evapotranspiration (ET₀) using Penman-Monteith equation
        
        Args:
            weather_data: Dictionary containing weather parameters
                - temp_c: Temperature in Celsius
                - humidity: Relative humidity (0-100)
                - wind_speed: Wind speed in m/s
                - solar_radiation: Solar radiation in MJ/m²/day
                - pressure: Atmospheric pressure in kPa (optional)
                - elevation: Elevation in meters (optional)
        
        Returns:
            ET₀ in mm/day
        """
        try:
            # Extract weather parameters
            temp_c = weather_data.get('temp_c', 20.0)
            humidity = weather_data.get('humidity', 50.0)
            wind_speed = weather_data.get('wind_speed', 2.0)
            solar_radiation = weather_data.get('solar_radiation', 15.0)
            pressure = weather_data.get('pressure', 101.3)  # Default sea level pressure
            elevation = weather_data.get('elevation', 0.0)
            
            # Convert temperature to Kelvin
            temp_k = temp_c + 273.15
            
            # Calculate saturation vapor pressure (es)
            es = 0.6108 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
            
            # Calculate actual vapor pressure (ea)
            ea = es * (humidity / 100.0)
            
            # Calculate vapor pressure deficit
            vapor_pressure_deficit = es - ea
            
            # Calculate slope of saturation vapor pressure curve (Δ)
            delta = (4098 * es) / ((temp_c + 237.3) ** 2)
            
            # Calculate psychrometric constant (γ)
            gamma = self.PSYCHROMETRIC_CONSTANT * pressure
            
            # Calculate net radiation (Rn) - simplified calculation
            # In practice, this would use more complex radiation models
            albedo = 0.23  # Typical crop albedo
            net_shortwave_radiation = solar_radiation * (1 - albedo)
            
            # Calculate net longwave radiation (simplified)
            net_longwave_radiation = self.STEFFAN_BOLTZMANN * temp_k**4 * (0.34 - 0.14 * math.sqrt(ea))
            
            # Net radiation
            net_radiation = net_shortwave_radiation - net_longwave_radiation
            
            # Calculate soil heat flux (G) - simplified
            soil_heat_flux = 0.1 * net_radiation  # Typical ratio for daily calculations
            
            # Calculate ET₀ using Penman-Monteith equation
            numerator = (delta * (net_radiation - soil_heat_flux) + 
                        self.GAS_CONSTANT * (900 / (temp_c + 273.15)) * wind_speed * vapor_pressure_deficit)
            
            denominator = delta + gamma * (1 + 0.34 * wind_speed)
            
            et0 = numerator / denominator
            
            # Ensure ET₀ is positive and reasonable
            et0 = max(0.0, min(et0, 15.0))  # Cap at 15 mm/day
            
            return round(et0, 3)
            
        except Exception as e:
            print(f"Error calculating Penman-Monteith ET₀: {e}")
            # Fallback to simplified calculation
            return self._fallback_et0_calculation(weather_data)
    
    def _fallback_et0_calculation(self, weather_data: Dict) -> float:
        """
        Fallback ET₀ calculation using Hargreaves-Samani method
        """
        temp_c = weather_data.get('temp_c', 20.0)
        temp_min = weather_data.get('temp_min', temp_c - 5.0)
        temp_max = weather_data.get('temp_max', temp_c + 5.0)
        solar_radiation = weather_data.get('solar_radiation', 15.0)
        
        # Hargreaves-Samani equation
        et0 = 0.0023 * (temp_c + 17.8) * math.sqrt(temp_max - temp_min) * solar_radiation * 0.408
        
        return max(0.0, round(et0, 3))
    
    def calculate_dynamic_kc(self, crop: str, age_days: float, weather_data: Dict, 
                           soil_data: Dict = None) -> float:
        """
        Calculate dynamic crop coefficient based on growth stage and conditions
        
        Args:
            crop: Crop type
            age_days: Age of crop in days
            weather_data: Current weather conditions
            soil_data: Soil-specific data (optional)
        
        Returns:
            Dynamic Kc value
        """
        try:
            crop_lower = crop.lower()
            if crop_lower not in self.CROP_PARAMS:
                crop_lower = 'tomato'  # Default fallback
            
            params = self.CROP_PARAMS[crop_lower]
            
            # Get base Kc for current growth stage
            base_kc = self._get_growth_stage_kc(params, age_days)
            
            # Apply weather-based adjustments
            temp_adjustment = self._calculate_temp_adjustment(weather_data, params)
            humidity_adjustment = self._calculate_humidity_adjustment(weather_data, params)
            wind_adjustment = self._calculate_wind_adjustment(weather_data)
            
            # Apply soil-based adjustments if available
            soil_adjustment = 0.0
            if soil_data:
                soil_adjustment = self._calculate_soil_adjustment(soil_data, params)
            
            # Calculate final Kc
            dynamic_kc = base_kc + temp_adjustment + humidity_adjustment + wind_adjustment + soil_adjustment
            
            # Ensure Kc is within reasonable bounds
            dynamic_kc = max(0.1, min(dynamic_kc, 1.5))
            
            return round(dynamic_kc, 3)
            
        except Exception as e:
            print(f"Error calculating dynamic Kc: {e}")
            # Return base Kc for growth stage
            return self._get_growth_stage_kc(self.CROP_PARAMS.get(crop.lower(), self.CROP_PARAMS['tomato']), age_days)
    
    def _get_growth_stage_kc(self, params: Dict, age_days: float) -> float:
        """Get base Kc for current growth stage"""
        base_kc = params['base_kc']
        growth_stages = params['growth_stages']
        
        if age_days <= growth_stages[0]:
            return base_kc[0]
        elif age_days <= growth_stages[1]:
            # Linear interpolation between stages
            ratio = (age_days - growth_stages[0]) / (growth_stages[1] - growth_stages[0])
            return base_kc[0] + ratio * (base_kc[1] - base_kc[0])
        elif age_days <= growth_stages[2]:
            ratio = (age_days - growth_stages[1]) / (growth_stages[2] - growth_stages[1])
            return base_kc[1] + ratio * (base_kc[2] - base_kc[1])
        elif age_days <= growth_stages[3]:
            ratio = (age_days - growth_stages[2]) / (growth_stages[3] - growth_stages[2])
            return base_kc[2] + ratio * (base_kc[3] - base_kc[2])
        else:
            return base_kc[3]
    
    def _calculate_temp_adjustment(self, weather_data: Dict, params: Dict) -> float:
        """Calculate temperature-based Kc adjustment"""
        temp_c = weather_data.get('temp_c', 20.0)
        optimal_temp = 25.0  # Optimal temperature for most crops
        
        temp_diff = temp_c - optimal_temp
        sensitivity = params.get('sensitivity_temp', 0.02)
        
        return temp_diff * sensitivity
    
    def _calculate_humidity_adjustment(self, weather_data: Dict, params: Dict) -> float:
        """Calculate humidity-based Kc adjustment"""
        humidity = weather_data.get('humidity', 50.0)
        optimal_humidity = 60.0  # Optimal humidity for most crops
        
        humidity_diff = humidity - optimal_humidity
        sensitivity = params.get('sensitivity_humidity', 0.01)
        
        return humidity_diff * sensitivity
    
    def _calculate_wind_adjustment(self, weather_data: Dict) -> float:
        """Calculate wind-based Kc adjustment"""
        wind_speed = weather_data.get('wind_speed', 2.0)
        
        # High wind increases ET, so increases Kc
        if wind_speed > 5.0:
            return 0.05  # Increase Kc for high wind
        elif wind_speed < 1.0:
            return -0.02  # Decrease Kc for low wind
        else:
            return 0.0
    
    def _calculate_soil_adjustment(self, soil_data: Dict, params: Dict) -> float:
        """Calculate soil-based Kc adjustment"""
        soil_type = soil_data.get('type', 'loam')
        drainage = soil_data.get('drainage', 'moderate')
        
        # Soil type adjustments
        soil_adjustments = {
            'clay': -0.05,  # Clay holds water better, lower Kc
            'loam': 0.0,    # Neutral
            'sandy': 0.05,   # Sandy soil needs more water, higher Kc
        }
        
        soil_adj = soil_adjustments.get(soil_type, 0.0)
        
        # Drainage adjustments
        drainage_adjustments = {
            'poor': -0.03,    # Poor drainage, lower Kc
            'moderate': 0.0,  # Neutral
            'good': 0.03,     # Good drainage, higher Kc
        }
        
        drainage_adj = drainage_adjustments.get(drainage, 0.0)
        
        return soil_adj + drainage_adj
    
    def calculate_soil_moisture(self, current_moisture: float, weather_data: Dict, 
                               soil_data: Dict, irrigation_amount: float = 0.0) -> float:
        """
        Calculate soil moisture based on weather, soil properties, and irrigation
        
        Args:
            current_moisture: Current soil moisture (0-1)
            weather_data: Weather conditions
            soil_data: Soil properties
            irrigation_amount: Irrigation amount in mm
        
        Returns:
            Predicted soil moisture (0-1)
        """
        try:
            soil_type = soil_data.get('type', 'loam')
            soil_params = self.SOIL_PARAMS.get(soil_type, self.SOIL_PARAMS['default'])
            
            field_capacity = soil_params['field_capacity']
            wilting_point = soil_params['wilting_point']
            
            # Calculate ET₀ and crop ET
            et0 = self.calculate_penman_monteith_et0(weather_data)
            kc = self.calculate_dynamic_kc(soil_data.get('crop', 'tomato'), 
                                         soil_data.get('age_days', 30), weather_data, soil_data)
            etc = et0 * kc
            
            # Calculate effective rainfall (simplified)
            rainfall = weather_data.get('rainfall', 0.0)
            effective_rainfall = rainfall * 0.8  # 80% efficiency
            
            # Calculate soil moisture change
            moisture_change = (effective_rainfall + irrigation_amount - etc) / 100.0  # Convert to fraction
            
            # Apply soil moisture limits
            new_moisture = current_moisture + moisture_change
            new_moisture = max(wilting_point, min(new_moisture, field_capacity))
            
            return round(new_moisture, 3)
            
        except Exception as e:
            print(f"Error calculating soil moisture: {e}")
            return current_moisture
    
    def calculate_irrigation_requirement(self, crop: str, area_m2: float, age_days: float,
                                        weather_data: Dict, soil_data: Dict,
                                        current_moisture: float) -> Dict:
        """
        Calculate irrigation requirement for a specific day
        
        Args:
            crop: Crop type
            area_m2: Plot area in square meters
            age_days: Crop age in days
            weather_data: Weather conditions
            soil_data: Soil properties
            current_moisture: Current soil moisture (0-1)
        
        Returns:
            Dictionary with irrigation recommendation
        """
        try:
            # Calculate ET₀ and Kc
            et0 = self.calculate_penman_monteith_et0(weather_data)
            kc = self.calculate_dynamic_kc(crop, age_days, weather_data, soil_data)
            etc = et0 * kc
            
            # Get soil parameters
            soil_type = soil_data.get('type', 'loam')
            soil_params = self.SOIL_PARAMS.get(soil_type, self.SOIL_PARAMS['default'])
            field_capacity = soil_params['field_capacity']
            wilting_point = soil_params['wilting_point']
            
            # Calculate effective rainfall
            rainfall = weather_data.get('rainfall', 0.0)
            effective_rainfall = rainfall * 0.8
            
            # Calculate soil moisture threshold for irrigation
            moisture_threshold = wilting_point + 0.1  # 10% above wilting point
            
            # Determine if irrigation is needed
            if current_moisture > moisture_threshold and effective_rainfall > etc * 0.5:
                # Sufficient moisture, no irrigation needed
                return {
                    'irrigation_needed': False,
                    'liters': 0.0,
                    'reason': 'Sufficient soil moisture and rainfall',
                    'et0': et0,
                    'kc': kc,
                    'etc': etc,
                    'soil_moisture': current_moisture
                }
            
            # Calculate irrigation requirement
            moisture_deficit = field_capacity - current_moisture
            irrigation_mm = max(0, etc - effective_rainfall + moisture_deficit * 10)  # Convert to mm
            
            # Convert to liters
            irrigation_liters = irrigation_mm * area_m2 / 1000.0  # Convert mm to liters
            
            # Apply efficiency factor
            irrigation_liters *= 1.1  # 10% efficiency loss
            
            return {
                'irrigation_needed': True,
                'liters': round(irrigation_liters, 2),
                'reason': f'ETc: {etc:.2f}mm, Rainfall: {effective_rainfall:.2f}mm',
                'et0': et0,
                'kc': kc,
                'etc': etc,
                'soil_moisture': current_moisture,
                'moisture_deficit': moisture_deficit
            }
            
        except Exception as e:
            print(f"Error calculating irrigation requirement: {e}")
            return {
                'irrigation_needed': False,
                'liters': 0.0,
                'reason': f'Calculation error: {str(e)}',
                'et0': 0.0,
                'kc': 0.0,
                'etc': 0.0,
                'soil_moisture': current_moisture
            }
    
    def generate_advanced_schedule(self, plot_data: Dict, weather_forecast: List[Dict],
                                 soil_data: Dict, historical_logs: List[Dict]) -> List[Dict]:
        """
        Generate advanced 7-day irrigation schedule
        
        Args:
            plot_data: Plot information (crop, area, age, etc.)
            weather_forecast: 7-day weather forecast
            soil_data: Soil properties
            historical_logs: Historical watering logs
        
        Returns:
            List of 7-day irrigation schedule
        """
        try:
            crop = plot_data.get('crop', 'tomato')
            area_m2 = plot_data.get('area', 1.0)
            age_days = plot_data.get('age_days', 30)
            
            # Initialize soil moisture
            current_moisture = soil_data.get('current_moisture', 0.3)
            
            schedule = []
            today = datetime.utcnow()
            
            for day_index in range(7):
                # Get weather data for this day
                day_weather = weather_forecast[day_index] if day_index < len(weather_forecast) else {}
                
                # Calculate irrigation requirement
                irrigation_req = self.calculate_irrigation_requirement(
                    crop, area_m2, age_days + day_index, day_weather, soil_data, current_moisture
                )
                
                # Update soil moisture for next day
                if irrigation_req['irrigation_needed']:
                    current_moisture = self.calculate_soil_moisture(
                        current_moisture, day_weather, soil_data, irrigation_req['liters'] * 1000 / area_m2
                    )
                else:
                    current_moisture = self.calculate_soil_moisture(
                        current_moisture, day_weather, soil_data, 0.0
                    )
                
                # Find optimal watering time
                optimal_time = self._find_optimal_watering_time(day_weather)
                
                # Create schedule entry
                date_obj = today + timedelta(days=day_index)
                schedule.append({
                    'day': f'Day {day_index + 1}',
                    'date': date_obj.strftime('%m/%d/%y'),
                    'liters': irrigation_req['liters'],
                    'optimal_time': optimal_time,
                    'explanation': irrigation_req['reason'],
                    'et0': irrigation_req['et0'],
                    'kc': irrigation_req['kc'],
                    'etc': irrigation_req['etc'],
                    'soil_moisture': current_moisture
                })
            
            return schedule
            
        except Exception as e:
            print(f"Error generating advanced schedule: {e}")
            return []
    
    def _find_optimal_watering_time(self, weather_data: Dict) -> str:
        """Find optimal watering time based on weather conditions"""
        temp = weather_data.get('temp_c', 20.0)
        wind = weather_data.get('wind_speed', 2.0)
        humidity = weather_data.get('humidity', 50.0)
        
        # Early morning is generally best (4-6 AM)
        # Adjust based on conditions
        if temp < 5.0 or wind > 8.0:
            return "06:00 AM"  # Later in morning for cold/windy conditions
        elif humidity > 80.0:
            return "05:00 AM"  # Earlier for high humidity
        else:
            return "05:00 AM"  # Standard early morning
    
    def backtest_algorithm(self, historical_data: List[Dict]) -> Dict:
        """
        Backtest the algorithm against historical data
        
        Args:
            historical_data: List of historical irrigation and weather data
        
        Returns:
            Backtest results with accuracy metrics
        """
        try:
            total_predictions = len(historical_data)
            correct_predictions = 0
            water_savings = 0.0
            accuracy_metrics = []
            
            for data_point in historical_data:
                # Extract data
                weather = data_point.get('weather', {})
                soil_data = data_point.get('soil_data', {})
                actual_irrigation = data_point.get('actual_irrigation', 0.0)
                crop_yield = data_point.get('crop_yield', 0.0)
                
                # Calculate predicted irrigation
                irrigation_req = self.calculate_irrigation_requirement(
                    data_point.get('crop', 'tomato'),
                    data_point.get('area', 1.0),
                    data_point.get('age_days', 30),
                    weather,
                    soil_data,
                    data_point.get('soil_moisture', 0.3)
                )
                
                predicted_irrigation = irrigation_req['liters']
                
                # Calculate accuracy
                if abs(predicted_irrigation - actual_irrigation) < actual_irrigation * 0.2:  # Within 20%
                    correct_predictions += 1
                
                # Calculate water savings
                water_savings += max(0, actual_irrigation - predicted_irrigation)
                
                accuracy_metrics.append({
                    'predicted': predicted_irrigation,
                    'actual': actual_irrigation,
                    'yield': crop_yield,
                    'accuracy': 1 - abs(predicted_irrigation - actual_irrigation) / max(actual_irrigation, 0.1)
                })
            
            accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0.0
            avg_water_savings = water_savings / total_predictions if total_predictions > 0 else 0.0
            
            return {
                'accuracy': accuracy,
                'total_predictions': total_predictions,
                'correct_predictions': correct_predictions,
                'avg_water_savings': avg_water_savings,
                'total_water_savings': water_savings,
                'accuracy_metrics': accuracy_metrics
            }
            
        except Exception as e:
            print(f"Error in backtesting: {e}")
            return {
                'accuracy': 0.0,
                'total_predictions': 0,
                'correct_predictions': 0,
                'avg_water_savings': 0.0,
                'total_water_savings': 0.0,
                'accuracy_metrics': []
            }


# Utility functions for integration with existing system
def convert_weather_data(openweather_data: Dict) -> Dict:
    """
    Convert OpenWeather data to format expected by advanced calculator
    
    Args:
        openweather_data: Weather data from OpenWeather API
    
    Returns:
        Converted weather data
    """
    try:
        main = openweather_data.get('main', {})
        wind = openweather_data.get('wind', {})
        clouds = openweather_data.get('clouds', {})
        
        return {
            'temp_c': main.get('temp', 20.0) - 273.15,  # Convert Kelvin to Celsius
            'humidity': main.get('humidity', 50.0),
            'wind_speed': wind.get('speed', 2.0),
            'pressure': main.get('pressure', 101.3) / 10.0,  # Convert hPa to kPa
            'solar_radiation': 15.0,  # Default, would need solar radiation data
            'rainfall': openweather_data.get('rain', {}).get('1h', 0.0) / 10.0  # Convert mm/h to mm
        }
    except Exception as e:
        print(f"Error converting weather data: {e}")
        return {
            'temp_c': 20.0,
            'humidity': 50.0,
            'wind_speed': 2.0,
            'pressure': 101.3,
            'solar_radiation': 15.0,
            'rainfall': 0.0
        }


def create_soil_data_from_plot(plot_data: Dict) -> Dict:
    """
    Create soil data from plot information
    
    Args:
        plot_data: Plot data from database
    
    Returns:
        Soil data dictionary
    """
    return {
        'type': plot_data.get('soil_type', 'loam'),
        'drainage': plot_data.get('drainage', 'moderate'),
        'current_moisture': plot_data.get('current_moisture', 0.3),
        'crop': plot_data.get('crop', 'tomato'),
        'age_days': plot_data.get('age_days', 30)
    }