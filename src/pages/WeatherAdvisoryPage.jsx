import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Search,
  Thermometer,
  CloudRain
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import DemoModeBadge from '../components/common/DemoModeBadge';

const PRESET_LOCATIONS = [
  'New York, NY',
  'Chicago, IL',
  'Austin, TX',
  'Seattle, WA',
  'Miami, FL',
  'Denver, CO'
];

export const WeatherAdvisoryPage = () => {
  const { showToast } = useToast();
  const [location, setLocation] = useState('New York, NY');
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('demo');

  const fetchWeather = async (loc) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/weather?location=${encodeURIComponent(loc)}`);
      setWeatherData(res.data);
      setMode(res.mode || 'demo');
    } catch (err) {
      showToast('Weather retrieval error: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <CloudSun className="w-6 h-6 text-accent-cyan" />
              Weather-Aware Construction Advisory
            </h1>
            <DemoModeBadge mode={mode} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic meteorological threshold alerts for concrete batching, tower crane lifts, and work at heights.
          </p>
        </div>

        {/* Location selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {PRESET_LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                location === loc
                  ? 'bg-accent-cyan text-navy-950 shadow-md shadow-cyan-950/40'
                  : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {loc.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Weather Disclaimer */}
      <DisclaimerBanner
        type="warning"
        title="Official Meteorological Operations Notice"
        text="OFFICIAL WEATHER ADVISORY NOTICE: Weather forecasts and automated site recommendations are for planning guidance only. Site superintendents and crane operators must monitor on-site calibrated anemometers, local weather radar, and official meteorological warnings. Do not conduct crane lifts or work at height during severe wind or lightning alerts."
      />

      {/* Main Telemetry & Quick Metrics */}
      {weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Current Conditions Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-navy-800 via-navy-850 to-navy-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
                  <MapPin className="w-4 h-4 text-accent-cyan" />
                  <span>{weatherData.location}</span>
                </div>
                <button
                  onClick={() => fetchWeather(location)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition"
                  title="Refresh telemetry"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {weatherData.current_temp}°C
                </span>
                <div>
                  <span className="text-base font-bold text-slate-200 block">{weatherData.condition}</span>
                  <span className="text-xs text-slate-400">Feels like {weatherData.feels_like}°C</span>
                </div>
              </div>

              {/* Grid of Key Telemetry Indicators */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                <div className="p-3 rounded-2xl bg-navy-900/60 border border-slate-800/80 flex items-center gap-3">
                  <Wind className="w-5 h-5 text-accent-cyan shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Wind Speed</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">{weatherData.wind_speed_kmh} km/h {weatherData.wind_direction}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-navy-900/60 border border-slate-800/80 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-accent-cyan shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Relative Humidity</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">{weatherData.humidity}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-navy-900/60 border border-slate-800/80 flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Solar UV Index</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">{weatherData.uv_index} of 10</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-navy-900/60 border border-slate-800/80 flex items-center gap-3">
                  <CloudRain className="w-5 h-5 text-accent-cyan shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Rain Probability</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">{weatherData.precipitation_probability}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Air Quality Index:</span>
              <span className="font-bold text-emerald-400">{weatherData.air_quality_index}</span>
            </div>
          </div>

          {/* Construction Operational Advisories (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-orange" />
              Automated Site Operational Advisories ({weatherData.advisories?.length || 0})
            </h3>

            <div className="space-y-3">
              {weatherData.advisories?.map((adv, idx) => {
                const isDanger = adv.severity === 'danger';
                const isWarning = adv.severity === 'warning';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition shadow-lg ${
                      isDanger
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-navy-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        {isDanger ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-slate-100">{adv.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {adv.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">{adv.message}</p>

                    <div className="p-2.5 rounded-xl bg-navy-950/60 border border-slate-800 text-[11px]">
                      <strong className="text-accent-cyan block mb-0.5">Required Precaution:</strong>
                      <span className="text-slate-300">{adv.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Outlook */}
      {weatherData && (
        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
            5-Day Working Forecast & Lifting Windows
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {weatherData.forecast?.map((day, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-navy-900/70 border border-slate-800 flex flex-col justify-between text-center"
              >
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{day.day_name}</span>
                  <span className="text-[10px] text-slate-500 block mb-2">{day.condition}</span>
                  <div className="text-xl font-bold text-slate-100 font-mono my-2">
                    {day.temp_high}° <span className="text-xs text-slate-500 font-normal">/ {day.temp_low}°</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                  <p>Wind: <strong className="text-slate-200">{day.wind_speed_kmh} km/h</strong></p>
                  <p>Rain: <strong className="text-accent-cyan">{day.rain_probability}%</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisoryPage;
