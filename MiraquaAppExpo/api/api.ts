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

export const getPlan = async (plot_id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/get_plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plot_id }),
    });

    if (!response.ok) {
      const text = await response.text(); // This will contain HTML if it's an error
      throw new Error(`Backend error: ${response.status} - ${text}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("❌ Error fetching schedule:", err);
    return { error: true, message: err.message };
  }
};


// ✅ Water Now endpoint
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

// ✅ Update Plot Settings endpoint
export const updatePlotSettings = async (plot_id: string, updates: any) => {
  try {
    const response = await fetch(`${BASE_URL}/update_plot_settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plot_id, updates }),
    });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchPlotById = async (plotId: string) => {
  try {
    console.log("🛰️ Sending request to:", `${BASE_URL}/get_plot_by_id?plot_id=${plotId}`);
    const res = await fetch(`${BASE_URL}/get_plot_by_id?plot_id=${plotId}`);
    const json = await res.json();
    console.log("[✅] Plot fetched:", json);
    return json;
  } catch (err) {
    console.error("❌ Failed to fetch plot", err);
    return null;
  }
};


