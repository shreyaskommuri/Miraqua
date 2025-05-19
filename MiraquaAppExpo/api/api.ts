import { MYIPADRESS } from '@env';

const BASE_URL = `http://${MYIPADRESS}:5050`;

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

export const getPlots = async () => {
  const response = await fetch(`${BASE_URL}/get_plots`);
  return await response.json();
};
