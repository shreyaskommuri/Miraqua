const API_URL = 'http://10.35.67.235:5050';

export const getIrrigationPlan = async (zip: string, crop: string, area: string) => {
  try {
    const response = await fetch(`${API_URL}/get_plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip, crop, area }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch irrigation plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch irrigation plan failed:', error);
    throw error;
  }
};

export const getPlots = async () => {
  try {
    const response = await fetch(`${API_URL}/get_plots`);
    if (!response.ok) {
      throw new Error('Failed to fetch plots');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch plots failed:', error);
    return [];
  }
};

export const savePlot = async (plot: any) => {
  try {
    const response = await fetch(`${API_URL}/add_plot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plot),
    });

    if (!response.ok) {
      throw new Error('Failed to save plot');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to save plot:', error);
    throw error;
  }
};
