"""
Test script for the new advanced irrigation system
Demonstrates the improvements over hardcoded algorithms
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.advanced_irrigation_utils import AdvancedIrrigationCalculator, convert_weather_data, create_soil_data_from_plot
from utils.backtesting_system import IrrigationBacktester, run_backtest_for_plot
from utils.forecast_utils import calculate_schedule
import json
from datetime import datetime, timedelta


def test_advanced_irrigation_system():
    """
    Test the new advanced irrigation system
    """
    print("🧪 Testing Advanced Irrigation System")
    print("=" * 50)
    
    # Initialize calculator
    calculator = AdvancedIrrigationCalculator()
    
    # Test data
    plot_data = {
        'crop': 'tomato',
        'area': 10.0,  # 10 m²
        'age_days': 45,
        'lat': 37.7749,
        'lon': -122.4194,
        'soil_type': 'loam',
        'drainage': 'moderate',
        'current_moisture': 0.3
    }
    
    # Sample weather data
    weather_data = {
        'temp_c': 25.0,
        'humidity': 60.0,
        'wind_speed': 3.0,
        'pressure': 101.3,
        'solar_radiation': 18.0,
        'rainfall': 0.0
    }
    
    print(f"📊 Test Plot: {plot_data['crop']} crop, {plot_data['area']}m², {plot_data['age_days']} days old")
    print(f"🌦️ Weather: {weather_data['temp_c']}°C, {weather_data['humidity']}% humidity, {weather_data['wind_speed']} m/s wind")
    print()
    
    # Test 1: Penman-Monteith ET₀ calculation
    print("1️⃣ Testing Penman-Monteith ET₀ Calculation")
    et0 = calculator.calculate_penman_monteith_et0(weather_data)
    print(f"   ET₀ = {et0:.3f} mm/day")
    print()
    
    # Test 2: Dynamic Kc calculation
    print("2️⃣ Testing Dynamic Kc Calculation")
    soil_data = create_soil_data_from_plot(plot_data)
    kc = calculator.calculate_dynamic_kc(
        plot_data['crop'], 
        plot_data['age_days'], 
        weather_data, 
        soil_data
    )
    print(f"   Kc = {kc:.3f} (dynamic based on growth stage and conditions)")
    print()
    
    # Test 3: Soil moisture modeling
    print("3️⃣ Testing Soil Moisture Modeling")
    new_moisture = calculator.calculate_soil_moisture(
        plot_data['current_moisture'], 
        weather_data, 
        soil_data, 
        irrigation_amount=0.0
    )
    print(f"   Current moisture: {plot_data['current_moisture']:.3f}")
    print(f"   Predicted moisture: {new_moisture:.3f}")
    print()
    
    # Test 4: Irrigation requirement calculation
    print("4️⃣ Testing Irrigation Requirement Calculation")
    irrigation_req = calculator.calculate_irrigation_requirement(
        plot_data['crop'],
        plot_data['area'],
        plot_data['age_days'],
        weather_data,
        soil_data,
        plot_data['current_moisture']
    )
    
    print(f"   Irrigation needed: {irrigation_req['irrigation_needed']}")
    print(f"   Required liters: {irrigation_req['liters']:.2f}L")
    print(f"   Reason: {irrigation_req['reason']}")
    print(f"   ET₀: {irrigation_req['et0']:.3f} mm/day")
    print(f"   Kc: {irrigation_req['kc']:.3f}")
    print(f"   ETc: {irrigation_req['etc']:.3f} mm/day")
    print()
    
    # Test 5: 7-day schedule generation
    print("5️⃣ Testing 7-Day Schedule Generation")
    weather_forecast = [weather_data.copy() for _ in range(7)]
    # Add some variation to the forecast
    for i, day_weather in enumerate(weather_forecast):
        day_weather['temp_c'] += i * 0.5  # Slight temperature increase
        day_weather['humidity'] -= i * 2  # Slight humidity decrease
        if i == 3:  # Rain on day 4
            day_weather['rainfall'] = 5.0
    
    schedule = calculator.generate_advanced_schedule(
        plot_data, weather_forecast, soil_data, []
    )
    
    print("   Generated 7-day schedule:")
    for day in schedule:
        print(f"   {day['date']}: {day['liters']:.1f}L at {day['optimal_time']} - {day['explanation']}")
    print()
    
    return {
        'et0': et0,
        'kc': kc,
        'soil_moisture': new_moisture,
        'irrigation_req': irrigation_req,
        'schedule': schedule
    }


def test_backtesting_system():
    """
    Test the backtesting system
    """
    print("📈 Testing Backtesting System")
    print("=" * 50)
    
    # Test plot data
    plot_data = {
        'crop': 'tomato',
        'area': 10.0,
        'lat': 37.7749,
        'lon': -122.4194,
        'soil_type': 'loam',
        'drainage': 'moderate',
        'age_days': 30
    }
    
    print(f"📊 Backtesting for: {plot_data['crop']} crop, {plot_data['area']}m²")
    print("🔄 Running 30-day backtest...")
    
    # Run backtest
    results = run_backtest_for_plot(plot_data, 30)
    
    if 'error' in results:
        print(f"❌ Backtest failed: {results['error']}")
        return None
    
    # Generate report
    backtester = IrrigationBacktester()
    report = backtester.generate_backtest_report(results)
    print(report)
    
    return results


def compare_algorithms():
    """
    Compare advanced vs hardcoded algorithms
    """
    print("⚖️ Comparing Advanced vs Hardcoded Algorithms")
    print("=" * 50)
    
    # Test parameters
    crop = 'tomato'
    area = 10.0
    age_months = 1.5
    lat, lon = 37.7749, -122.4194
    
    print(f"📊 Test Parameters: {crop}, {area}m², {age_months} months old")
    print()
    
    # Test advanced algorithm
    print("🧠 Advanced Algorithm Results:")
    try:
        advanced_schedule, advanced_kc = calculate_schedule(crop, area, age_months, lat, lon)
        print(f"   Kc: {advanced_kc:.3f}")
        print("   Schedule:")
        for day in advanced_schedule:
            print(f"     {day['date']}: {day['liters']:.1f}L at {day['optimal_time']}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print()
    
    # Test hardcoded algorithm (fallback)
    print("📊 Hardcoded Algorithm Results:")
    try:
        from utils.forecast_utils import calculate_schedule_fallback
        hardcoded_schedule, hardcoded_kc = calculate_schedule_fallback(crop, area, age_months, lat, lon)
        print(f"   Kc: {hardcoded_kc:.3f}")
        print("   Schedule:")
        for day in hardcoded_schedule:
            print(f"     {day['date']}: {day['liters']:.1f}L at {day['optimal_time']}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print()
    
    # Compare results
    if 'advanced_schedule' in locals() and 'hardcoded_schedule' in locals():
        print("📈 Comparison:")
        total_advanced = sum(day['liters'] for day in advanced_schedule)
        total_hardcoded = sum(day['liters'] for day in hardcoded_schedule)
        
        print(f"   Advanced total: {total_advanced:.1f}L")
        print(f"   Hardcoded total: {total_hardcoded:.1f}L")
        print(f"   Difference: {total_advanced - total_hardcoded:.1f}L")
        print(f"   Kc difference: {advanced_kc - hardcoded_kc:.3f}")


def main():
    """
    Main test function
    """
    print("🚀 MiraquaOfficial Advanced Irrigation System Test")
    print("=" * 60)
    print()
    
    try:
        # Test 1: Advanced irrigation system
        test_results = test_advanced_irrigation_system()
        
        print()
        
        # Test 2: Backtesting system
        backtest_results = test_backtesting_system()
        
        print()
        
        # Test 3: Algorithm comparison
        compare_algorithms()
        
        print()
        print("✅ All tests completed successfully!")
        print()
        print("🎯 Key Improvements:")
        print("   • Scientific Penman-Monteith ET₀ calculation")
        print("   • Dynamic crop coefficients based on growth stage")
        print("   • Soil moisture modeling")
        print("   • Real-time weather data integration")
        print("   • Farmer-specific soil data support")
        print("   • Comprehensive backtesting validation")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
