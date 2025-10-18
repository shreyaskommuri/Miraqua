import { supabase } from '../utils/supabase';
import { environment } from '../config/environment';

export interface Plot {
  id: string;
  name: string;
  crop: string;
  zip_code: string;
  created_at: string;
  area: number;
  ph_level: number;
  lat: number | null;
  lon: number | null;
  flex_type: string;
  planting_date: string;
  age_at_entry: number;
  custom_constraints: string;
  user_id: string;
  updated_at: string;
  // New scientific irrigation fields
  soil_type?: string;
  drainage?: string;
  current_moisture?: number;
}

export const getPlots = async (): Promise<{ success: boolean; plots?: Plot[]; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      console.log('User not authenticated:', userError);
      return { success: false, error: 'User not authenticated' };
    }

    console.log('🔍 Fetching plots for user:', user.id);

    // For now, use Supabase directly to avoid backend issues
    const { data: plots, error } = await supabase
      .from('plots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plots:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Plots fetched successfully:', plots);
    return { success: true, plots: plots || [] };
  } catch (err: any) {
    console.error('Error in getPlots:', err);
    return { success: false, error: err.message };
  }
};

export const getPlotById = async (plotId: string): Promise<{ success: boolean; plot?: Plot; error?: string }> => {
  try {
    console.log('🔍 Fetching plot by ID:', plotId);

    // Use local backend if in development, otherwise use Supabase
    if (environment.isDevelopment) {
      try {
        const response = await fetch(`${environment.apiUrl}/get_plot_by_id?plot_id=${plotId}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Backend API error:', errorData);
          return { success: false, error: errorData.error || 'Backend API error' };
        }
        const data = await response.json();
        console.log('✅ Plot fetched from backend:', data);
        return { success: true, plot: data };
      } catch (backendError: any) {
        console.log('⚠️ Backend API failed, falling back to Supabase:', backendError.message);
        // Fallback to Supabase if backend fails
      }
    }

    // Fallback to Supabase (either production or if backend fails)
    const { data: plot, error } = await supabase
      .from('plots')
      .select('*')
      .eq('id', plotId)
      .single();

    if (error) {
      console.error('Error fetching plot:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Plot fetched successfully:', plot);
    return { success: true, plot };
  } catch (err: any) {
    console.error('Error in getPlotById:', err);
    return { success: false, error: err.message };
  }
};

export const addPlot = async (plotData: Omit<Plot, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; plot?: Plot; error?: string }> => {
  try {
    console.log('🔍 addPlot called with:', plotData);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔍 User auth result:', { user: user?.id, error: userError });
    
    if (userError || !user?.id) {
      console.log('❌ User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    // Ensure all required fields are present with proper types
    const plotWithDefaults = {
      ...plotData,
      user_id: user.id
    };

    console.log('🔍 Final plot data to insert:', plotWithDefaults);

    // Use Supabase directly for now
    console.log('🔍 Attempting Supabase insert...');
    const { data: plot, error } = await supabase
      .from('plots')
      .insert([plotWithDefaults])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }
    
    console.log('✅ Plot created successfully via Supabase:', plot);
    return { success: true, plot };
  } catch (err: any) {
    console.error('Error in addPlot:', err);
    return { success: false, error: err.message };
  }
};

export const updatePlot = async (plotId: string, updates: Partial<Plot>): Promise<{ success: boolean; plot?: Plot; error?: string }> => {
  try {
    const { data: plot, error } = await supabase
      .from('plots')
      .update(updates)
      .eq('id', plotId)
      .select()
      .single();

    if (error) {
      console.error('Error updating plot:', error);
      return { success: false, error: error.message };
    }

    return { success: true, plot };
  } catch (err: any) {
    console.error('Error in updatePlot:', err);
    return { success: false, error: err.message };
  }
};

export const deletePlot = async (plotId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('plots')
      .delete()
      .eq('id', plotId);

    if (error) {
      console.error('Error deleting plot:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in deletePlot:', err);
    return { success: false, error: err.message };
  }
};

// New scientific irrigation API functions
export const getIrrigationMetrics = async (plotId: string): Promise<{ success: boolean; metrics?: any; error?: string }> => {
  try {
    console.log('🔍 Fetching irrigation metrics for plot:', plotId);
    
    const response = await fetch(`${environment.apiUrl}/get_irrigation_metrics?plot_id=${plotId}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Irrigation metrics API error:', errorData);
      return { success: false, error: errorData.error || 'Failed to fetch irrigation metrics' };
    }
    
    const data = await response.json();
    console.log('✅ Irrigation metrics fetched:', data);
    return { success: true, metrics: data };
  } catch (err: any) {
    console.error('Error in getIrrigationMetrics:', err);
    return { success: false, error: err.message };
  }
};

export const getWeatherData = async (plotId: string): Promise<{ success: boolean; weather?: any; error?: string }> => {
  try {
    console.log('🔍 Fetching weather data for plot:', plotId);
    
    const response = await fetch(`${environment.apiUrl}/get_weather?plot_id=${plotId}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Weather API error:', errorData);
      return { success: false, error: errorData.error || 'Failed to fetch weather data' };
    }
    
    const data = await response.json();
    console.log('✅ Weather data fetched:', data);
    return { success: true, weather: data };
  } catch (err: any) {
    console.error('Error in getWeatherData:', err);
    return { success: false, error: err.message };
  }
};

export const getScientificSchedule = async (plotId: string): Promise<{ success: boolean; schedule?: any; error?: string }> => {
  try {
    console.log('🔍 Fetching scientific schedule for plot:', plotId);
    
    const response = await fetch(`${environment.apiUrl}/get_plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plot_id: plotId,
        use_original: false,
        force_refresh: true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Scientific schedule API error:', errorData);
      return { success: false, error: errorData.error || 'Failed to fetch scientific schedule' };
    }
    
    const data = await response.json();
    console.log('✅ Scientific schedule fetched:', data);
    return { success: true, schedule: data };
  } catch (err: any) {
    console.error('Error in getScientificSchedule:', err);
    return { success: false, error: err.message };
  }
}; 