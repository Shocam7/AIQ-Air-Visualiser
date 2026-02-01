'use client';

import { useEffect, useRef, useState } from 'react';
import { ParticleSimulation, ParticleConfig } from '@/lib/particleSimulation';
import InfoPanel from '@/components/InfoPanel';

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
  const sliderRef = useRef<HTMLDivElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [particleConfig, setParticleConfig] = useState<ParticleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [simulatedAQI, setSimulatedAQI] = useState<number | null>(null);

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
      setSimulatedAQI(aqiResult.aqi);

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

  // Generate new particle config based on AQI value
  const generateConfigForAQI = async (aqi: number) => {
    if (!aqiData) return;

    const category = getAQICategory(aqi);

    try {
      const particleResponse = await fetch('/api/generate-particles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aqi: aqi,
          category: category,
          pollutants: aqiData.pollutants
        })
      });

      if (particleResponse.ok) {
        const config = await particleResponse.json();
        setParticleConfig(config);
      }
    } catch (err) {
      console.error('Failed to generate new particle config:', err);
    }
  };

  // Handle slider drag
  const handleSliderDrag = (clientY: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
    const newAQI = Math.round(percentage * 500); // 0-500 AQI range
    
    setSimulatedAQI(newAQI);
    generateConfigForAQI(newAQI);
  };

  // Mouse events for slider
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderDrag(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleSliderDrag(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events for slider
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderDrag(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleSliderDrag(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

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

  const getAQICategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
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

      {/* AQI Badge - Top Left */}
      <InfoPanel 
        aqi={simulatedAQI || aqiData?.aqi || null}
        category={simulatedAQI ? getAQICategory(simulatedAQI) : (aqiData?.category || null)}
        location={aqiData ? { city: aqiData.location.city, country: aqiData.location.country } : null}
      />

      {/* AQI Slider - Right Side */}
      {cameraActive && aqiData && (
        <div className="aqi-slider-container">
          <div 
            ref={sliderRef}
            className="aqi-slider"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Gradient Background */}
            <div className="slider-gradient"></div>
            
            {/* AQI Labels */}
            <div className="slider-label" style={{ top: '0%' }}>500</div>
            <div className="slider-label" style={{ top: '20%' }}>400</div>
            <div className="slider-label" style={{ top: '40%' }}>300</div>
            <div className="slider-label" style={{ top: '60%' }}>200</div>
            <div className="slider-label" style={{ top: '80%' }}>100</div>
            <div className="slider-label" style={{ top: '100%' }}>0</div>

            {/* Selector */}
            <div 
              className="slider-selector"
              style={{ 
                bottom: `${((simulatedAQI || 0) / 500) * 100}%`,
                background: getAQIColor(simulatedAQI || 0)
              }}
            >
              <div className="selector-value">{simulatedAQI || 0}</div>
              <div className="selector-handle"></div>
            </div>

            {/* Original AQI marker if different from simulated */}
            {simulatedAQI !== aqiData.aqi && (
              <div 
                className="original-marker"
                style={{ 
                  bottom: `${(aqiData.aqi / 500) * 100}%`,
                }}
              >
                <div className="marker-line"></div>
                <div className="marker-label">Actual: {aqiData.aqi}</div>
              </div>
            )}
          </div>
        </div>
      )}

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
          <>
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

            <div className="action-buttons-bottom">
              <button onClick={fetchAQI} className="refresh-button" disabled={loading}>
                ↻
              </button>
              <button onClick={stopCamera} className="stop-button">
                ✕
              </button>
            </div>
          </>
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
          pointer-events: none;
        }

        .controls-overlay > * {
          pointer-events: auto;
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

        .loading-indicator {
          text-align: center;
          color: white;
          background: rgba(0, 0, 0, 0.7);
          padding: 24px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
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
          background: rgba(0, 0, 0, 0.7);
          border-radius: 16px;
          backdrop-filter: blur(10px);
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

        .action-buttons-bottom {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          z-index: 100;
        }

        .action-buttons-bottom button {
          width: 56px;
          height: 56px;
          border: none;
          border-radius: 50%;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .refresh-button {
          background: rgba(102, 126, 234, 0.9);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .refresh-button:hover:not(:disabled) {
          transform: translateY(-2px) rotate(180deg);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stop-button {
          background: rgba(255, 59, 48, 0.9);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .stop-button:hover {
          background: rgba(255, 59, 48, 1);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 59, 48, 0.5);
        }

        /* AQI Slider */
        .aqi-slider-container {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          pointer-events: auto;
        }

        .aqi-slider {
          position: relative;
          width: 60px;
          height: 70vh;
          max-height: 600px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          user-select: none;
          overflow: visible;
        }

        .slider-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 28px;
          background: linear-gradient(to top,
            #00e400 0%,
            #ffff00 10%,
            #ff7e00 30%,
            #ff0000 40%,
            #8f3f97 60%,
            #7e0023 100%
          );
          opacity: 0.6;
        }

        .slider-label {
          position: absolute;
          right: -45px;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          font-family: 'Space Mono', monospace;
        }

        .slider-selector {
          position: absolute;
          left: 50%;
          transform: translate(-50%, 50%);
          width: 100%;
          height: 4px;
          transition: bottom 0.1s ease-out;
          z-index: 10;
        }

        .selector-value {
          position: absolute;
          left: -60px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          border: 2px solid currentColor;
        }

        .selector-handle {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: white;
          border: 3px solid currentColor;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          cursor: grab;
        }

        .selector-handle:active {
          cursor: grabbing;
        }

        .original-marker {
          position: absolute;
          left: 0;
          right: 0;
          transform: translateY(50%);
          z-index: 5;
          pointer-events: none;
        }

        .marker-line {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          position: relative;
        }

        .marker-line::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }

        .marker-label {
          position: absolute;
          right: -110px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          backdrop-filter: blur(10px);
        }

        @media (max-width: 640px) {
          .start-button {
            padding: 18px 36px;
            font-size: 20px;
          }

          .aqi-slider-container {
            right: 10px;
          }

          .aqi-slider {
            width: 50px;
            height: 60vh;
          }

          .selector-value {
            left: -55px;
            font-size: 14px;
            padding: 4px 10px;
          }

          .slider-label {
            right: -40px;
            font-size: 11px;
          }

          .marker-label {
            right: -100px;
            font-size: 10px;
          }

          .action-buttons-bottom button {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}