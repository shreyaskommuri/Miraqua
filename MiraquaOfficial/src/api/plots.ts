import { supabase } from '../utils/supabase';

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
    if (userError || !user?.id) {
      console.log('User not authenticated:', userError);
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Fetching plots for user:', user.id);

    const { data: plots, error } = await supabase
      .from('plots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plots:', error);
      return { success: false, error: error.message };
    }

    console.log('Plots fetched successfully:', plots);
    return { success: true, plots: plots || [] };
  } catch (err: any) {
    console.error('Error in getPlots:', err);
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
    
    console.log('✅ Plot created successfully:', plot);

    console.log('Plot added successfully:', plot);
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