import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aqi, category, pollutants } = body;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an air quality visualization expert. Based on the following air quality data, generate a JavaScript particle simulation configuration that will be used to render air particles on a canvas overlay.

Air Quality Data:
- AQI: ${aqi}
- Category: ${category}
- Pollutants: ${JSON.stringify(pollutants, null, 2)}

Generate a JSON configuration object with the following structure:
{
  "particleCount": <number of particles to render, higher AQI = more particles>,
  "particles": [
    {
      "type": "<pollutant type like PM2.5, PM10, NO2, etc>",
      "color": "<hex color that represents this pollutant>",
      "size": <base size in pixels>,
      "speed": <movement speed multiplier>,
      "opacity": <base opacity 0-1>,
      "count": <number of this type of particle>
    }
  ],
  "background": {
    "overlay": "<rgba color for background tint>",
    "description": "<brief description of what the air looks like>"
  },
  "behavior": {
    "turbulence": <0-1, how chaotic the movement is>,
    "drift": <-1 to 1, horizontal drift direction>,
    "sinkRate": <0-1, how fast particles settle>
  },
  "effects": {
    "glow": <true/false, should particles glow>,
    "trails": <true/false, should particles leave trails>,
    "pulse": <true/false, should particles pulse>
  }
}

Guidelines:
- Higher AQI (unhealthy air) should have more particles, darker colors, more turbulence
- PM2.5 and PM10 are typically gray/brown particles
- NO2 might be brownish/orange
- O3 (ozone) might be bluish
- Good air (AQI 0-50) should have very few particles, light colors
- Hazardous air (AQI 300+) should be dense, dark, with strong visual effects
- Make the visualization scientifically representative but visually clear

Respond ONLY with valid JSON, no markdown, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Parse the JSON
    const config = JSON.parse(cleanedText);

    return NextResponse.json(config);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate particle simulation',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
  
