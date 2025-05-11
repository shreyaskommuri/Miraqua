import { MYIPADRESS } from '@env';

export const addPlot = async (plot: any) => {
  try {
    console.log('Sending plot:', plot);
    const response = await fetch(`http://${MYIPADRESS}:5050/add_plot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plot),
    });
    const json = await response.json();
    console.log('Add plot response:', json);
    return json;
  } catch (err) {
    console.error('Failed to add plot', err);
    return { success: false };
  }
};

export const getPlots = async () => {
  try {
    const response = await fetch(`http://${MYIPADRESS}:5050/get_plots`);
    const json = await response.json();
    console.log('Received plots:', json);
    return json;
  } catch (err) {
    console.error('Failed to fetch plots', err);
    return { success: false, plots: [] };
  }
};
