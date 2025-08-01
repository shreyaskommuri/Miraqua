# Miraqua Official - React Native App

This is the official Miraqua smart garden management app built with React Native and Expo.

## Features

- **Smart Garden Management**: Monitor and control your garden plots
- **Real-time Monitoring**: Track moisture, temperature, and sunlight levels
- **Automated Watering**: Schedule and control irrigation systems
- **AI Chat Assistant**: Get gardening advice and troubleshooting help
- **Weather Integration**: Smart watering based on weather forecasts
- **Analytics Dashboard**: Track water usage and plant health metrics

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation between screens
- **Ionicons**: Icon library
- **Supabase**: Backend and database

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MiraquaOfficial
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base UI components (Button, Card, etc.)
│   └── screens/       # Screen components
├── navigation/         # Navigation configuration
├── contexts/          # React contexts for state management
├── hooks/             # Custom React hooks
├── services/          # API and external services
├── utils/             # Utility functions
└── pages/             # Main page components
```

## Key Components

### UI Components
- **Button**: Customizable button with multiple variants
- **Card**: Container component for content
- **Badge**: Status indicators
- **Progress**: Progress bars for metrics
- **ScrollArea**: Scrollable content areas

### Screens
- **HomeScreen**: Main dashboard with plots overview
- **AnalyticsScreen**: Detailed analytics and metrics
- **PlotDetailsScreen**: Individual plot management
- **AddPlotScreen**: Add new garden plots
- **ChatScreen**: AI gardening assistant

## Development

### Adding New Components

1. Create the component in `src/components/ui/`
2. Use React Native components (View, Text, TouchableOpacity, etc.)
3. Add TypeScript interfaces for props
4. Include StyleSheet for styling

### Styling Guidelines

- Use StyleSheet.create() for all styles
- Follow React Native naming conventions
- Use consistent color palette and spacing
- Ensure accessibility with proper contrast ratios

### State Management

- Use React hooks for local state
- Context API for global state
- AsyncStorage for persistent data
- Supabase for backend synchronization

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
