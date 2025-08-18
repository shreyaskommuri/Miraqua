# Miraqua Official Backend

Flask-based backend API for the Miraqua Official smart garden management application.

## Features

- **Plot Management**: Create, read, update, delete garden plots
- **AI Schedule Generation**: Intelligent watering schedules based on weather and crop data
- **Weather Integration**: Real-time weather data from Open-Meteo API
- **FarmerAI Chat**: AI-powered gardening assistant
- **Supabase Integration**: Cloud database for data persistence
- **Real-time Monitoring**: Sensor data processing and storage

## Project Structure

```
backend/
├── app_backend.py          # Main Flask application
├── start_backend.py        # Startup script
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── utils/                  # Utility modules
│   ├── forecast_utils.py   # Weather & scheduling utilities
│   ├── schedule_utils.py   # Schedule processing
│   └── supabase_utils.py   # Database utilities
└── farmerAI/              # AI modules
    ├── farmer_ai.py        # Main AI processing
    └── __init__.py         # Package initialization
```

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

Copy and configure your `.env` file with:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Weather API
OPENWEATHER_API_KEY=your_openweather_key

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key

# Environment
RENDER=false
```

### 3. Start the Server

```bash
python start_backend.py
```

Or directly:

```bash
python app_backend.py
```

The server will start on `http://localhost:5050`

## API Endpoints

### Plot Management
- `GET /get_plots` - List all plots
- `GET /get_plot_by_id?plot_id={id}` - Get single plot
- `POST /add_plot` - Create new plot
- `POST /update_plot_settings` - Update plot configuration

### Schedule Management  
- `POST /get_plan` - Get AI-generated schedule
- `POST /generate_ai_schedule` - Generate new AI schedule
- `POST /revert_schedule` - Revert to original schedule

### Actions & Control
- `POST /water_now` - Trigger manual watering

### AI & Chat
- `POST /chat` - AI chat interaction
- `POST /get_chat_log` - Get chat history

## Dependencies

- **Flask**: Web framework
- **Supabase**: Database and authentication
- **pandas/numpy**: Data processing
- **requests**: HTTP client for weather API
- **python-dotenv**: Environment variable management
- **flask-cors**: Cross-origin resource sharing

## Development

### Adding New Endpoints

1. Add route to `app_backend.py`
2. Implement request validation
3. Add error handling
4. Update this documentation

### Database Schema

The backend uses these Supabase tables:
- `plots`: Garden plot information
- `plot_schedules`: AI-generated watering schedules
- `watering_log`: Watering history and logs
- `chat_log`: AI chat conversation history

## Deployment

For production deployment:

1. Set `RENDER=true` in environment
2. Configure production Supabase credentials
3. Use a production WSGI server (gunicorn)

```bash
gunicorn app_backend:app --bind 0.0.0.0:5050
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Database Connection**: Verify Supabase credentials in `.env`
3. **Weather API**: Check OpenWeather API key validity
4. **Port Conflicts**: Change PORT environment variable if needed

### Logs

The backend logs important events to console. For production, configure proper logging to files.

## Support

For backend-specific issues:
1. Check the server logs
2. Verify environment configuration
3. Test API endpoints with curl or Postman
4. Ensure frontend is pointing to correct backend URL
