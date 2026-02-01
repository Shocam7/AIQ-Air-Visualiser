'use client';

import { useEffect, useRef, useState } from 'react';
import { ParticleSimulation, ParticleConfig } from '@/lib/particleSimulation';

interface AQIData {
  location: {
    name: string;
    city: string;
    country: string;
  };
  aqi: number;
  category: string;
  pollutants: Array<{
    parameter: string;
    value: number;
    unit: string;
  }>;
}

export default function AIQCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<ParticleSimulation | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [particleConfig, setParticleConfig] = useState<ParticleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err: any) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
    
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }
  };

  // Get user location and fetch AQI
  const fetchAQI = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lon: longitude });

      // Fetch AQI data
      const aqiResponse = await fetch(
        `/api/aqi?lat=${latitude}&lon=${longitude}`
      );

      if (!aqiResponse.ok) {
        const errorData = await aqiResponse.json();
        throw new Error(errorData.error || 'Failed to fetch AQI data');
      }

      const aqiResult = await aqiResponse.json();
      setAqiData(aqiResult);

      // Generate particle simulation with AI
      const particleResponse = await fetch('/api/generate-particles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aqi: aqiResult.aqi,
          category: aqiResult.category,
          pollutants: aqiResult.pollutants
        })
      });

      if (!particleResponse.ok) {
        throw new Error('Failed to generate particle simulation');
      }

      const config = await particleResponse.json();
      setParticleConfig(config);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch air quality data');
      console.error('AQI fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize particle simulation
  useEffect(() => {
    if (canvasRef.current && particleConfig && cameraActive) {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }

      // Create or update simulation
      if (simulationRef.current) {
        simulationRef.current.updateConfig(particleConfig);
      } else {
        simulationRef.current = new ParticleSimulation(canvas, particleConfig);
        simulationRef.current.start();
      }
    }
  }, [particleConfig, cameraActive]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current && simulationRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        simulationRef.current.resize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  return (
    <div className="camera-container" ref={containerRef}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
      />
      
      <canvas
        ref={canvasRef}
        className="particle-canvas"
      />

      <div className="controls-overlay">
        {!cameraActive && !loading && (
          <button
            onClick={() => {
              startCamera();
              if (!aqiData) fetchAQI();
            }}
            className="start-button"
          >
            Start AIQ
          </button>
        )}

        {cameraActive && (
          <div className="info-panel">
            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Analyzing air quality...</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={fetchAQI} className="retry-button">
                  Retry
                </button>
              </div>
            )}

            {aqiData && (
              <div className="aqi-display">
                <div className="aqi-header">
                  <div 
                    className="aqi-value"
                    style={{ backgroundColor: getAQIColor(aqiData.aqi) }}
                  >
                    {aqiData.aqi}
                  </div>
                  <div className="aqi-info">
                    <h3>{aqiData.category}</h3>
                    <p className="location-name">
                      {aqiData.location.city}, {aqiData.location.country}
                    </p>
                  </div>
                </div>

                {particleConfig && (
                  <div className="air-description">
                    <p>{particleConfig.background.description}</p>
                  </div>
                )}

                <div className="pollutants-grid">
                  {aqiData.pollutants.slice(0, 4).map((pollutant, idx) => (
                    <div key={idx} className="pollutant-item">
                      <span className="pollutant-name">{pollutant.parameter}</span>
                      <span className="pollutant-value">
                        {pollutant.value.toFixed(1)} {pollutant.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={fetchAQI} className="refresh-button" disabled={loading}>
                Refresh AQI
              </button>
              <button onClick={stopCamera} className="stop-button">
                Stop Camera
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .camera-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
        }

        .camera-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .particle-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .controls-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 10;
        }

        .start-button {
          padding: 24px 48px;
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 60px;
          cursor: pointer;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .start-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 50px rgba(102, 126, 234, 0.5);
        }

        .info-panel {
          width: 100%;
          max-width: 400px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .loading-indicator {
          text-align: center;
          color: white;
        }

        .spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 16px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          color: #ff6b6b;
          padding: 16px;
        }

        .retry-button {
          margin-top: 12px;
          padding: 10px 24px;
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .aqi-display {
          color: white;
        }

        .aqi-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .aqi-value {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          border-radius: 16px;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .aqi-info h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
        }

        .location-name {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }

        .air-description {
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .air-description p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .pollutants-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .pollutant-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pollutant-name {
          font-size: 11px;
          text-transform: uppercase;
          opacity: 0.7;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .pollutant-value {
          font-size: 16px;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .action-buttons button {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .refresh-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .refresh-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stop-button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .stop-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 640px) {
          .info-panel {
            max-width: 100%;
          }
          
          .start-button {
            padding: 18px 36px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
