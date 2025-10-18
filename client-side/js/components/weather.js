import { apiClient } from '../utils/api.js';
import { showMessage } from '../utils/helpers.js';

class WeatherWidget {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showForecast: true,
            autoUpdate: true,
            updateInterval: 30 * 60 * 1000, // 30 minutes
            ...options
        };
        
        if (this.container) {
            this.initialize();
        }
    }

    initialize() {
        this.renderLoading();
        
        // If there's event data, try to get weather
        const eventData = window.currentEventData;
        if (eventData && eventData.latitude && eventData.longitude) {
            this.loadWeather(eventData.latitude, eventData.longitude);
        }
    }

    async loadWeather(latitude, longitude) {
        try {
            this.renderLoading();
            
            const weatherData = await apiClient.getWeather(latitude, longitude);
            
            if (weatherData.success) {
                this.renderWeather(weatherData.data);
                
                // Set up automatic updates
                if (this.options.autoUpdate) {
                    this.startAutoUpdate(latitude, longitude);
                }
            } else {
                this.renderError('Unable to get weather information');
            }
        } catch (error) {
            console.error('Weather loading failed:', error);
            this.renderError('Weather service temporarily unavailable');
        }
    }

    renderWeather(weather) {
        this.container.innerHTML = `
            <div class="weather-card">
                <div class="weather-header">
                    <div>
                        <div class="weather-temp">${Math.round(weather.temperatureMax)}°</div>
                        <div class="weather-desc">${weather.weatherDescription}</div>
                    </div>
                    <div class="weather-icon">
                        ${this.getWeatherIcon(weather.weatherCode)}
                    </div>
                </div>
                
                <div class="weather-details">
                    <div class="weather-detail">
                        <span class="value">${Math.round(weather.temperatureMin)}°</span>
                        <span class="label">Min Temp</span>
                    </div>
                    <div class="weather-detail">
                        <span class="value">${Math.round(weather.temperatureMax)}°</span>
                        <span class="label">Max Temp</span>
                    </div>
                </div>
                
                ${this.options.showForecast && weather.forecast ? this.renderForecast(weather.forecast) : ''}
            </div>
        `;
    }

    renderForecast(forecast) {
        return `
            <div class="weather-forecast" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
                <div style="font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.8;">Forecast</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                    ${forecast.map(day => `
                        <div style="text-align: center;">
                            <div style="font-size: 0.8rem; opacity: 0.8;">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div style="font-size: 1.2rem; margin: 0.25rem 0;">${this.getWeatherIcon(day.weatherCode, 'small')}</div>
                            <div style="font-size: 0.8rem;">${Math.round(day.temperatureMax)}°</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getWeatherIcon(weatherCode, size = 'normal') {
        const iconSize = size === 'small' ? '20px' : '40px';
        
        // Simple weather icon mapping
        const iconMap = {
            'Clear': '☀️',
            'Mainly Clear': '🌤️',
            'Partly Cloudy': '⛅',
            'Overcast': '☁️',
            'Fog': '🌫️',
            'Freezing Fog': '🌫️',
            'Light Drizzle': '🌦️',
            'Moderate Drizzle': '🌧️',
            'Heavy Drizzle': '🌧️',
            'Light Freezing Drizzle': '🌨️',
            'Heavy Freezing Drizzle': '🌨️',
            'Light Rain Showers': '🌦️',
            'Moderate Rain Showers': '🌧️',
            'Heavy Rain Showers': '⛈️',
            'Light Snow': '🌨️',
            'Moderate Snow': '❄️',
            'Heavy Snow': '❄️',
            'Snow Grains': '🌨️',
            'Light Snow Showers': '🌨️',
            'Heavy Snow Showers': '❄️',
            'Thunderstorm': '⛈️',
            'Thunderstorm with Light Hail': '⛈️',
            'Thunderstorm with Heavy Hail': '⛈️'
        };

        const description = this.getWeatherDescription(weatherCode);
        const emoji = iconMap[description] || '🌈';
        
        return `<span style="font-size: ${iconSize};">${emoji}</span>`;
    }

    getWeatherDescription(code) {
        const weatherMap = {
            0: 'Clear',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Freezing Fog',
            51: 'Light Drizzle',
            53: 'Moderate Drizzle',
            55: 'Heavy Drizzle',
            56: 'Light Freezing Drizzle',
            57: 'Heavy Freezing Drizzle',
            61: 'Light Rain',
            63: 'Moderate Rain',
            65: 'Heavy Rain',
            66: 'Freezing Rain',
            67: 'Heavy Freezing Rain',
            71: 'Light Snow',
            73: 'Moderate Snow',
            75: 'Heavy Snow',
            77: 'Snow Grains',
            80: 'Light Rain Showers',
            81: 'Moderate Rain Showers',
            82: 'Heavy Rain Showers',
            85: 'Light Snow Showers',
            86: 'Heavy Snow Showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with Light Hail',
            99: 'Thunderstorm with Heavy Hail'
        };
        
        return weatherMap[code] || 'Unknown';
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="weather-card">
                <div class="loading">
                    <div class="spinner" style="border-top-color: white;"></div>
                    <div style="margin-top: 0.5rem; opacity: 0.8;">Loading weather information...</div>
                </div>
            </div>
        `;
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="weather-card">
                <div style="text-align: center; opacity: 0.8;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🌤️</div>
                    <div>${message}</div>
                </div>
            </div>
        `;
    }

    startAutoUpdate(latitude, longitude) {
        this.updateInterval = setInterval(() => {
            this.loadWeather(latitude, longitude);
        }, this.options.updateInterval);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    destroy() {
        this.stopAutoUpdate();
        this.container.innerHTML = '';
    }
}

export { WeatherWidget };