import { supabase } from '../utils/supabase';

export interface Plot {
  id: string;
  name: string;
  type: string; // Changed from crop to type to match HomeScreen
  crop: string;
  moisture: number;
  temperature: number;
  sunlight: number;
  health: number; // Added to match HomeScreen
  status: string;
  nextWatering: string;
  location: string;
  waterUsage: number;
  sensorStatus: string;
  batteryLevel: number;
  soilPh: number;
  lastWatered: string;
  humidity: number; // Added to match HomeScreen
  wifiStatus: string; // Added to match HomeScreen
  area?: number;
  zip_code?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const getPlots = async (): Promise<{ success: boolean; plots?: Plot[]; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: plots, error } = await supabase
      .from('plots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plots:', error);
      return { success: false, error: error.message };
    }

    return { success: true, plots: plots || [] };
  } catch (err: any) {
    console.error('Error in getPlots:', err);
    return { success: false, error: err.message };
  }
};

export const addPlot = async (plotData: Omit<Plot, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; plot?: Plot; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    // Add default values for missing fields
    const plotWithDefaults = {
      ...plotData,
      type: plotData.type || plotData.crop, // Use crop as type if type is not provided
      health: plotData.health || 85, // Default health
      humidity: plotData.humidity || 80, // Default humidity
      wifiStatus: plotData.wifiStatus || '#10B981', // Default online status
      user_id: user.id
    };

    const { data: plot, error } = await supabase
      .from('plots')
      .insert([plotWithDefaults])
      .select()
      .single();

    if (error) {
      console.error('Error adding plot:', error);
      return { success: false, error: error.message };
    }

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