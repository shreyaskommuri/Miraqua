function normalizeCropName(name) {
  const aliases = {
    Tomato: 'Tomato Fresh',
    Almond: 'Almonds',
    Grape: 'Vineyard',
    Citrus: 'Citrus',
    Lettuce: 'Lettuce',
    Corn: 'Corn',
    Spinach: 'Truck Crops'
  };

  return aliases[name] || name;
}

function getMoistureMessage(cropName, value) {
  const match = cropMoistureData.find(crop => crop.cropname === cropName);
  if (!match) return '';

  const min = parseFloat(match.low);
  const max = parseFloat(match.high);

  if (value < min) return '⚠️ Too Dry';
  if (value > max) return '⚠️ Too Wet';
  return '✅ Optimal';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('optimizer-form').addEventListener('submit', event => {
    event.preventDefault();
    getWateringPlan();
  });

  document.getElementById('knowRoot').addEventListener('change', event => {
    const showRoot = event.target.value === 'yes';
    document.getElementById('rootSection').style.display = showRoot ? 'block' : 'none';
    document.getElementById('ageSection').style.display = showRoot ? 'none' : 'block';
  });

  document.getElementById('gauge').addEventListener('change', event => {
    document.getElementById('rainSection').style.display = event.target.value === 'yes' ? 'block' : 'none';
  });

  document.getElementById('knowMoisture').addEventListener('change', event => {
    document.getElementById('moistureSection').style.display = event.target.value === 'yes' ? 'block' : 'none';
  });
});

async function getWateringPlan() {
  const zip = document.getElementById('zip').value;
  const crop = document.getElementById('crop').value;
  const area = parseFloat(document.getElementById('area').value);
  const knowRoot = document.getElementById('knowRoot').value;
  const rootDepth = parseFloat(document.getElementById('rootDepth').value) || 0;
  const cropAge = parseFloat(document.getElementById('cropAge').value) || 1;
  const gauge = document.getElementById('gauge').value;
  const rain = parseFloat(document.getElementById('rain').value) || 0;
  const knowMoisture = document.getElementById('knowMoisture').value;
  const soilMoisture = parseFloat(document.getElementById('soilMoisture').value) || 0;
  const applied = parseFloat(document.getElementById('applied').value) || 0;

  const payload = {
    zip,
    crop,
    area,
    know_root: knowRoot,
    root_depth: rootDepth,
    crop_age: cropAge,
    gauge,
    rain,
    know_moisture: knowMoisture,
    soil_moisture: soilMoisture,
    applied
  };

  try {
    const res = await fetch('http://127.0.0.1:5000/get_plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from backend');
    }

    const data = await res.json();
    const scheduleContainer = document.getElementById('schedule');

    scheduleContainer.innerHTML = `
      <div class="calendar-grid">
        ${data.schedule
          .map(day => {
            const normalizedCrop = normalizeCropName(crop);
            const status = getMoistureMessage(normalizedCrop, day.soil_moisture);
            let moistureClass = '';

            if (status.includes('Optimal')) moistureClass = 'optimal';
            else if (status.includes('Too Dry')) moistureClass = 'too-dry';
            else if (status.includes('Too Wet')) moistureClass = 'too-wet';

            return `
              <div class="calendar-day ${moistureClass}">
                <h4>${day.day.split(' ')[0]}</h4>
                <p>${day.date}</p>
                <p>🌡️ Temp: <strong>${day.temp}°F</strong></p>
                <p>☔ Rain: <strong>${day.rain} mm</strong></p>
                <div class="soil-box">
                  <p><strong>Soil Moisture <span title='Amount of water held in soil, shown in cubic meters per cubic meter'>ℹ️</span></strong></p>
                  <p>🌱 <strong>${day.soil_moisture} m³/m³</strong> — ${status}</p>
                </div>
                <p>🌤️ ET₀: <strong>${day.et0} mm</strong></p>
                <p>🌿 ETc: <strong>${day.etc} mm</strong></p>
                <p>💧 Water: <strong>${day.liters} L</strong></p>
              </div>`;
          })
          .join('')}
      </div>
      <div class="summary-box">${data.summary}</div>
    `;
  } catch (error) {
    document.getElementById('schedule').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}
