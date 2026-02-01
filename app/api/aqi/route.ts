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

  const apiKey = process.env.OPENAQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAQ API key not configured. Please add OPENAQ_API_KEY to your .env.local file.' },
      { status: 500 }
    );
  }

  try {
    // OpenAQ API v3 - Get latest measurements near coordinates
    const radius = 25000; // 25km radius
    const response = await axios.get('https://api.openaq.org/v3/locations', {
      params: {
        coordinates: `${lat},${lon}`,
        radius,
        limit: 10,
        'order_by': 'distance'
      },
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      const locations = response.data.results;
      
      // Get the first location with valid measurements
      const locationWithData = locations.find((loc: any) => 
        loc.parameters && loc.parameters.length > 0
      );

      if (locationWithData) {
        // Fetch latest measurements for this location
        const measurementsResponse = await axios.get(
          `https://api.openaq.org/v3/locations/${locationWithData.id}/latest`,
          {
            headers: {
              'Accept': 'application/json',
              'X-API-Key': apiKey
            }
          }
        );

        const measurements = measurementsResponse.data?.results?.measurements || [];
        
        // Extract relevant pollutants
        const pollutants = measurements.map((m: any) => ({
          parameter: m.parameter?.name || m.parameter,
          value: m.value,
          unit: m.unit,
          lastUpdated: m.datetime?.last || m.datetime
        }));

        // Calculate overall AQI (simplified US EPA formula)
        const pm25 = measurements.find((m: any) => 
          m.parameter?.name === 'pm25' || m.parameter === 'pm25'
        );
        
        let aqi = 0;
        let category = 'Unknown';
        
        if (pm25 && pm25.value !== null) {
          aqi = calculateAQI(pm25.value);
          category = getAQICategory(aqi);
        }

        return NextResponse.json({
          location: {
            name: locationWithData.name,
            city: locationWithData.city,
            country: locationWithData.country,
            coordinates: locationWithData.coordinates
          },
          aqi,
          category,
          pollutants,
          timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      error: 'No air quality data found for this location',
      message: 'Try a different location or check back later'
    }, { status: 404 });

  } catch (error: any) {
    console.error('OpenAQ API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch air quality data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Simplified AQI calculation for PM2.5 (US EPA)
function calculateAQI(pm25: number): number {
  const breakpoints = [
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500, iLow: 301, iHigh: 500 }
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  return 500; // Hazardous
}

function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
  }
