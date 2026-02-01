# AIQ Quick Start Guide

Get your AIQ application up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Modern web browser (Chrome, Firefox, Safari, Edge)
- [ ] Google Gemini API key ([Get free key](https://makersuite.google.com/app/apikey))

## Step-by-Step Setup

### 1. Navigate to Project
```bash
cd aiq-app
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Google Generative AI SDK
- Axios

### 3. Configure Environment Variables

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Gemini API key:
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyA_your_actual_key_here
```

**Get your Gemini API key:**
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste it in `.env.local`

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open in Browser
Navigate to: http://localhost:3000

### 6. Test the Application

1. **Grant Permissions**: Click "Allow" when prompted for:
   - Camera access
   - Location access

2. **Click "Start AIQ"**: The application will:
   - Activate your camera
   - Detect your location
   - Fetch real-time AQI data
   - Generate AI particle simulation
   - Display results

3. **Expected Result**:
   - You see your camera feed
   - Particle overlay appears based on local air quality
   - AQI card shows current air quality data
   - Pollutant measurements are displayed

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Camera Access Denied
- Use HTTPS in production (HTTP only works on localhost)
- Check browser permissions: Settings → Privacy → Camera
- Try a different browser

### "No AQI data found"
- You may be in a rural area without monitoring stations
- Try testing from a different location
- Check OpenAQ API status: https://openaq.org

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Key Not Working
- Verify key is correct (no extra spaces)
- Ensure it starts with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`
- Check Gemini API quota: https://aistudio.google.com/app/apikey

## Next Steps

### Ready to Deploy?
See `DEPLOYMENT.md` for full Vercel deployment instructions.

Quick deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel
```

## Getting Help

1. Check browser console for errors (F12)
2. Review `README.md` for detailed docs
3. Verify environment variables are set correctly
4. Ensure all dependencies installed: `npm install`

---

🎉 **Congratulations!** Your AIQ application is now running!
