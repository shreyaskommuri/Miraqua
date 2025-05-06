const API_URL = 'http://10.35.67.235:5050'; // Replace with your backend IP if needed

export const getIrrigationPlan = async (zip: string, crop: string, area: string) => {
  const response = await fetch(`${API_URL}/get_plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zip, crop, area }),
  });

  if (!response.ok) {
    throw new Error('Failed to get plan');
  }

  return await response.json();
};

export const addPlot = async (plot: {
  crop: string;
  area: string;
  zip: string;
  summary: string;
  schedule: any;
}) => {
  const response = await fetch(`${API_URL}/add_plot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plot),
  });

  if (!response.ok) {
    throw new Error('Failed to add plot');
  }

  return await response.json();
};

export const getPlots = async () => {
  const response = await fetch(`${API_URL}/get_plots`);
  if (!response.ok) {
    throw new Error('Failed to fetch plots');
  }
  return await response.json();
};
