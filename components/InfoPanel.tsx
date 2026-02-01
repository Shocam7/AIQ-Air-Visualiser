'use client';

import { useState } from 'react';

export default function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="info-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Information"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      {isOpen && (
        <div className="info-overlay" onClick={() => setIsOpen(false)}>
          <div className="info-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h1>AIQ - Air Quality Intelligence</h1>
            
            <section>
              <h2>What is AIQ?</h2>
              <p>
                AIQ combines real-time air quality data with AI-powered visualization 
                to help you understand the air you breathe. By overlaying particle 
                simulations on your camera feed, you can literally see air pollution.
              </p>
            </section>

            <section>
              <h2>How it works</h2>
              <ol>
                <li>
                  <strong>Location Detection:</strong> We use your device location 
                  to find nearby air quality monitoring stations
                </li>
                <li>
                  <strong>Data Retrieval:</strong> Real-time AQI data is fetched 
                  from OpenAQ, a global air quality database
                </li>
                <li>
                  <strong>AI Analysis:</strong> Google Gemini AI analyzes the 
                  pollution data and generates a custom particle simulation
                </li>
                <li>
                  <strong>Visualization:</strong> Particles representing actual 
                  pollutants are rendered over your camera feed
                </li>
              </ol>
            </section>

            <section>
              <h2>Understanding AQI</h2>
              <div className="aqi-legend">
                <div className="aqi-item">
                  <div className="aqi-color" style={{ background: '#00e400' }}></div>
                  <div>
                    <strong>0-50 Good</strong>
                    <p>Air quality is satisfactory</p>
                  </div>
                </div>
                <div className="aqi-item">
                  <div className="aqi-color" style={{ background: '#ffff00' }}></div>
                  <div>
                    <strong>51-100 Moderate</strong>
                    <p>Acceptable for most people</p>
                  </div>
                </div>
                <div className="aqi-item">
                  <div className="aqi-color" style={{ background: '#ff7e00' }}></div>
                  <div>
                    <strong>101-150 Unhealthy for Sensitive Groups</strong>
                    <p>Sensitive individuals may experience effects</p>
                  </div>
                </div>
                <div className="aqi-item">
                  <div className="aqi-color" style={{ background: '#ff0000' }}></div>
                  <div>
                    <strong>151-200 Unhealthy</strong>
                    <p>Everyone may experience health effects</p>
                  </div>
                </div>
                <div className="aqi-item">
                  <div className="aqi-color" style={{ background: '#8f3f97' }}></div>
                  <div>
                    <strong>201-300 Very Unhealthy</strong>
                    <p>Health alert: everyone may experience more serious effects</p>
                  </div>
                </div>
                <div className="aqi-item">
                  <div className="aqi-color" style={{ background: '#7e0023' }}></div>
                  <div>
                    <strong>301+ Hazardous</strong>
                    <p>Health warning of emergency conditions</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2>Common Pollutants</h2>
              <ul>
                <li>
                  <strong>PM2.5:</strong> Fine particles (≤2.5 micrometers) 
                  that can penetrate deep into lungs
                </li>
                <li>
                  <strong>PM10:</strong> Coarse particles (≤10 micrometers) 
                  from dust, pollen, and mold
                </li>
                <li>
                  <strong>NO2:</strong> Nitrogen dioxide from vehicle emissions 
                  and industrial processes
                </li>
                <li>
                  <strong>O3:</strong> Ground-level ozone formed by sunlight 
                  reacting with pollutants
                </li>
                <li>
                  <strong>SO2:</strong> Sulfur dioxide from fossil fuel combustion
                </li>
                <li>
                  <strong>CO:</strong> Carbon monoxide from incomplete combustion
                </li>
              </ul>
            </section>

            <section>
              <h2>Privacy & Permissions</h2>
              <p>
                AIQ requires camera and location access to function. Your camera 
                feed is processed locally on your device and is never uploaded 
                or stored. Location data is only used to fetch nearby air quality 
                readings from public databases.
              </p>
            </section>

            <section className="credits">
              <h2>Credits</h2>
              <p><strong>Data:</strong> OpenAQ - Open Air Quality Data</p>
              <p><strong>AI:</strong> Google Gemini</p>
              <p><strong>Built with:</strong> Next.js, TypeScript, Canvas API</p>
            </section>
          </div>
        </div>
      )}

      <style jsx>{`
        .info-button {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
          width: 48px;
          height: 48px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .info-button:hover {
          background: rgba(102, 126, 234, 0.8);
          transform: scale(1.05);
        }

        .info-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .info-content {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 24px;
          padding: 40px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        h1 {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #667eea;
        }

        section {
          margin-bottom: 32px;
        }

        p {
          line-height: 1.8;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        ol, ul {
          margin-left: 24px;
          line-height: 1.8;
        }

        li {
          margin-bottom: 12px;
          opacity: 0.9;
        }

        .aqi-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .aqi-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 12px;
        }

        .aqi-color {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .aqi-item strong {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .aqi-item p {
          font-size: 12px;
          margin: 0;
          opacity: 0.7;
        }

        .credits {
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .credits p {
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .info-content {
            padding: 24px;
          }

          h1 {
            font-size: 28px;
          }

          h2 {
            font-size: 20px;
          }

          .info-button {
            width: 44px;
            height: 44px;
            top: 16px;
            right: 16px;
          }
        }

        /* Custom scrollbar for info content */
        .info-content::-webkit-scrollbar {
          width: 8px;
        }

        .info-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .info-content::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 4px;
        }

        .info-content::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.7);
        }
      `}</style>
    </>
  );
}
