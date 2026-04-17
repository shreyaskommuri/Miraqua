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
}

export const getPlots = async (): Promise<{ success: boolean; plots?: Plot[]; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) return { success: false, error: 'User not authenticated' };

    const { data: plots, error } = await supabase
      .from('plots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, plots: plots || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getPlotById = async (plotId: string): Promise<{ success: boolean; plot?: Plot; error?: string }> => {
  try {
    if (environment.isDevelopment) {
      try {
        const response = await fetch(`${environment.apiUrl}/get_plot_by_id?plot_id=${plotId}`);
        if (response.ok) {
          const data = await response.json();
          return { success: true, plot: data };
        }
      } catch (_) {
        // fall through to Supabase
      }
    }

    const { data: plot, error } = await supabase
      .from('plots')
      .select('*')
      .eq('id', plotId)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, plot };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const addPlot = async (plotData: Omit<Plot, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; plot?: Plot; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) return { success: false, error: 'User not authenticated' };

    const { data: plot, error } = await supabase
      .from('plots')
      .insert([{ ...plotData, user_id: user.id }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, plot };
  } catch (err: any) {
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