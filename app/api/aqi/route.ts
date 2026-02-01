import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  const apiToken = process.env.AQICN_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: 'AQICN API token not configured. Please add AQICN_API_TOKEN to your .env.local file. Get your token at https://aqicn.org/data-platform/token/' },
      { status: 500 }
    );
  }

  try {
    // AQICN API - Get data for geo coordinates
    const response = await axios.get(
      `https://api.waqi.info/feed/geo:${lat};${lon}/`,
      {
        params: {
          token: apiToken
        }
      }
    );

    if (response.data.status !== 'ok') {
      return NextResponse.json({
        error: 'No air quality data found for this location',
        message: 'Try a different location or check back later'
      }, { status: 404 });
    }

    const data = response.data.data;

    // Extract pollutants from iaqi (individual air quality index)
    const pollutants = [];
    if (data.iaqi) {
      const pollutantMap: { [key: string]: string } = {
        'pm25': 'PM2.5',
        'pm10': 'PM10',
        'o3': 'O3',
        'no2': 'NO2',
        'so2': 'SO2',
        'co': 'CO'
      };

      for (const [key, label] of Object.entries(pollutantMap)) {
        if (data.iaqi[key]) {
          pollutants.push({
            parameter: label,
            value: data.iaqi[key].v,
            unit: key === 'co' ? 'mg/m³' : 'µg/m³',
            lastUpdated: data.time?.iso || new Date().toISOString()
          });
        }
      }
    }

    // Get AQI value and category
    const aqi = data.aqi || 0;
    const category = getAQICategory(aqi);

    return NextResponse.json({
      location: {
        name: data.city?.name || 'Unknown',
        city: data.city?.name || 'Unknown',
        country: data.city?.country || 'Unknown',
        coordinates: {
          latitude: data.city?.geo?.[0] || parseFloat(lat),
          longitude: data.city?.geo?.[1] || parseFloat(lon)
        }
      },
      aqi,
      category,
      pollutants,
      timestamp: data.time?.iso || new Date().toISOString(),
      attribution: data.attributions || []
    });

  } catch (error: any) {
    console.error('AQICN API Error:', error.response?.data || error.message);
    
    // Check if it's a token error
    if (error.response?.data?.data === 'Invalid key') {
      return NextResponse.json(
        { 
          error: 'Invalid AQICN API token',
          details: 'Please check your API token at https://aqicn.org/data-platform/token/'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch air quality data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}