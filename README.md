# AIQ - Air Quality Intelligence

A Next.js web application that visualizes real-time air quality data through AI-generated particle simulations overlaid on live camera feed.

## Features

- 🎥 **Live Camera Feed**: Access device camera to show real-time video
- 🌍 **Real Air Quality Data**: Fetches AQI from OpenAQ API based on user location
- 🤖 **AI-Powered Visualization**: Uses Google Gemini AI to generate contextual particle simulations
- ✨ **Dynamic Particle Effects**: Canvas-based particle system with realistic air pollution visualization
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, glassmorphic interface with smooth animations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI**: Google Gemini (gemini-1.5-flash)
- **API**: OpenAQ API v3
- **Styling**: CSS-in-JS with modern design patterns
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18.x or higher
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Modern web browser with camera access

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aiq-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Grant Permissions**: Allow camera and location access when prompted
2. **Start AIQ**: Click the "Start AIQ" button to begin
3. **View Results**: See your local AQI data and watch AI-generated particles simulate air quality
4. **Refresh**: Click "Refresh AQI" to get updated air quality data
5. **Stop**: Click "Stop Camera" to end the session

## How It Works

### 1. Location & AQI Fetching
- User location is obtained via Geolocation API
- OpenAQ API is queried for nearby air quality monitoring stations
- AQI is calculated using US EPA standards for PM2.5

### 2. AI Particle Generation
- Air quality data (AQI, category, pollutants) is sent to Gemini AI
- Gemini generates a particle simulation configuration based on:
  - Pollution levels
  - Pollutant types (PM2.5, PM10, NO2, O3, etc.)
  - Visual representation guidelines
- Configuration includes particle count, colors, behaviors, and effects

### 3. Visualization
- HTML5 Canvas is overlaid on the video feed
- Particle system animates based on AI-generated configuration
- Particles represent actual air pollutants with appropriate:
  - Density (more particles = worse air quality)
  - Colors (pollutant-specific)
  - Movement patterns (turbulence, drift, settling)
  - Visual effects (glow, trails, pulsing)

## API Endpoints

### GET `/api/aqi?lat={latitude}&lon={longitude}`
Fetches air quality data for given coordinates.

**Response:**
```json
{
  "location": {
    "name": "Station Name",
    "city": "City",
    "country": "Country"
  },
  "aqi": 87,
  "category": "Moderate",
  "pollutants": [
    {
      "parameter": "pm25",
      "value": 25.3,
      "unit": "µg/m³"
    }
  ]
}
```

### POST `/api/generate-particles`
Generates particle simulation configuration using Gemini AI.

**Request:**
```json
{
  "aqi": 87,
  "category": "Moderate",
  "pollutants": [...]
}
```

**Response:**
```json
{
  "particleCount": 150,
  "particles": [...],
  "background": {
    "overlay": "rgba(100, 80, 60, 0.1)",
    "description": "Moderate pollution with visible haze"
  },
  "behavior": {...},
  "effects": {...}
}
```

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add: `NEXT_PUBLIC_GEMINI_API_KEY`
   - Value: Your Gemini API key

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for AI generation | Yes |

## Browser Requirements

- Modern browser with:
  - WebRTC/MediaDevices API support (camera access)
  - Geolocation API support
  - HTML5 Canvas support
  - ES6+ JavaScript support

## Troubleshooting

### Camera not working
- Ensure you're using HTTPS (required for camera access)
- Check browser permissions for camera access
- Try a different browser

### No AQI data found
- OpenAQ may not have monitoring stations in your area
- Try a different location
- Check OpenAQ API status

### Particle simulation not showing
- Verify Gemini API key is set correctly
- Check browser console for errors
- Ensure canvas is properly sized

## Performance Optimization

- Particle count automatically scales with AQI
- Canvas rendering optimized with requestAnimationFrame
- AI calls cached to reduce latency
- Responsive design adapts to screen size

## Future Enhancements

- [ ] Historical AQI data visualization
- [ ] Multiple pollutant tracking
- [ ] Comparison with WHO guidelines
- [ ] Save/share snapshots
- [ ] Health recommendations based on AQI
- [ ] AR mode with device orientation
- [ ] Multi-language support

## License

MIT

## Credits

- **OpenAQ**: Air quality data
- **Google Gemini**: AI-powered visualization
- **Next.js**: Web framework
- **Vercel**: Hosting platform

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Built with ❤️ for cleaner air awareness
