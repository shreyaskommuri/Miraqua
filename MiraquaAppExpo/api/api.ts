import { EXPO_PUBLIC_MYIPADRESS } from '@env';

const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;  //https://miraqua.onrender.com or http://${EXPO_PUBLIC_MYIPADRESS}:5050 depending on what environment you are in

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
    return { success: true, plots: data }; // ✅ wrap it
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
