import { EXPO_PUBLIC_MYIPADRESS } from '@env';

const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;

export const signup = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

export const addPlot = async (plot: any) => {
  const response = await fetch(`${BASE_URL}/add_plot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plot),
  });
  return await response.json();
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
  crop: string,
  area: number,
  plot_id: string,
  lat: number,
  lon: number
) => {
  try {
    const response = await fetch(`${BASE_URL}/get_plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, area, plot_id, lat, lon }),
    });
    return await response.json();
  } catch (error: any) {
    return { error: true, reason: error.message };
  }
};

// ✅ NEW: Water Now endpoint
export const waterNow = async (plot_id: string, duration_minutes: number) => {
  try {
    const response = await fetch(`${BASE_URL}/water_now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plot_id, duration_minutes }),
    });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
