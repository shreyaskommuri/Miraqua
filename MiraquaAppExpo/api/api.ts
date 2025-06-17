import { EXPO_PUBLIC_MYIPADRESS } from '@env';

const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;

export const signup = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
};

export const addPlot = async (plotData: any) => {
  const response = await fetch(`${BASE_URL}/add_plot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plotData),
  });
  return response.json();
};

export const getPlots = async (userId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/get_plots?user_id=${userId}`);
    const data = await response.json();
    return { success: true, plots: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getPlan = async (
  plotId: string,
  useOriginal = false,
  forceRefresh = false
) => {
  try {
    const params = new URLSearchParams({
      plot_id:       plotId,
      use_original:  useOriginal.toString(),
      force_refresh: forceRefresh.toString(),
    });
    const response = await fetch(`${BASE_URL}/get_plan?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Backend error: ${response.status} - ${text}`);
    }

    return response.json();
  } catch (err: any) {
    console.error('❌ Error fetching schedule:', err);
    return { error: true, message: err.message };
  }
};

export const waterNow = async (plot_id: string, duration_minutes: number) => {
  try {
    const response = await fetch(`${BASE_URL}/water_now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plot_id, duration_minutes }),
    });
    return response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updatePlotSettings = async (
  plot_id: string,
  updates: Record<string, any>
): Promise<
  | { success: true; plot: any }
  | { success: false; error: string }
> => {
  try {
    const response = await fetch(`${BASE_URL}/update_plot_settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plot_id, updates }),
    });
    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data.error || 'Unknown error' };
    }
    return { success: true, plot: data.plot };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getSchedule = async (
  plotId: string,
  useOriginal = false,
  forceRefresh = false
) => {
  const params = new URLSearchParams({
    plot_id:       plotId,
    use_original:  useOriginal.toString(),
    force_refresh: forceRefresh.toString(),
  });
  const response = await fetch(`${BASE_URL}/get_plan?${params.toString()}`, {
    method: 'GET',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend error: ${response.status} - ${text}`);
  }
  return response.json();
};
