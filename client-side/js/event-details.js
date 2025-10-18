import { apiClient } from './utils/api.js';
import { showMessage, setPageTitle, formatDate, formatCurrency, formatNumber } from './utils/helpers.js';
import { WeatherWidget } from './components/weather.js';

class EventDetailsPage {
    constructor() {
        this.eventId = this.getEventIdFromUrl();
        this.eventData = null;
        this.registrations = [];
        this.weatherWidget = null;

        this.initialize();
    }

    getEventIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async initialize() {
        if (!this.eventId) {
            this.showError('Invalid event ID');
            return;
        }

        await this.loadEventDetails();
        this.setupEventListeners();
    }

    async loadEventDetails() {
        try {
            const response = await apiClient.getEventById(this.eventId);
            
            if (response.success) {
                this.eventData = response.data.event;
                this.registrations = response.data.registrations || [];
                
                this.renderEventDetails();
                this.renderRegistrations();
                this.initWeatherWidget();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Failed to load event details:', error);
            this.showError('Failed to load event details');
        }
    }

    renderEventDetails() {
        if (!this.eventData) return;

        setPageTitle(this.eventData.title);

        // Update page title and basic information
        const container = document.getElementById('event-details');
        if (!container) return;

        container.innerHTML = `
            <div class="event-header">
                <div class="row">
                    <div class="col-8">
                        <h1>${this.eventData.title}</h1>
                        <div class="event-meta">
                            <span class="event-category">${this.eventData.category_name}</span>
                            <span class="event-organization">${this.eventData.organization_name}</span>
                        </div>
                    </div>
                    <div class="col-4 text-right">
                        <div class="event-price">${this.eventData.ticket_price === 0 ? 'Free' : formatCurrency(this.eventData.ticket_price)}</div>
                        <a href="register.html?event_id=${this.eventId}" class="btn btn-primary btn-lg">Register Now</a>
                    </div>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-8">
                    <div class="card">
                        <img src="${this.eventData.image_url || '/images/event-default.jpg'}" 
                             alt="${this.eventData.title}" 
                             class="event-image-large"
                             onerror="this.src='/images/event-default.jpg'">
                        
                        <div class="event-content">
                            <h3>Event Details</h3>
                            <p>${this.eventData.full_description || this.eventData.description}</p>
                            
                            <div class="event-info-grid">
                                <div class="info-item">
                                    <strong>Date & Time</strong>
                                    <p>${formatDate(this.eventData.event_date)}</p>
                                </div>
                                <div class="info-item">
                                    <strong>Location</strong>
                                    <p>${this.eventData.location}</p>
                                    ${this.eventData.venue_details ? `<p class="text-muted">${this.eventData.venue_details}</p>` : ''}
                                </div>
                                <div class="info-item">
                                    <strong>Organizer</strong>
                                    <p>${this.eventData.organization_name}</p>
                                    ${this.eventData.organization_contact ? `<p class="text-muted">${this.eventData.organization_contact}</p>` : ''}
                                </div>
                                <div class="info-item">
                                    <strong>Ticket Information</strong>
                                    <p>Maximum Participants: ${formatNumber(this.eventData.max_attendees)}</p>
                                    <p>Registered: ${formatNumber(this.registrations.length)} people</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-4">
                    <div id="weather-widget"></div>
                    
                    <div class="card">
                        <h3>Event Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-value">${formatNumber(this.registrations.length)}</div>
                                <div class="stat-label">Registrations</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${formatNumber(this.eventData.current_tickets || 0)}</div>
                                <div class="stat-label">Tickets Sold</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${this.eventData.funding_progress ? this.eventData.funding_progress.toFixed(1) + '%' : 'N/A'}</div>
                                <div class="stat-label">Funding Progress</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRegistrations() {
        const container = document.getElementById('event-registrations');
        if (!container) return;

        if (this.registrations.length === 0) {
            container.innerHTML = '<p class="text-center">No registration records yet</p>';
            return;
        }

        container.innerHTML = `
            <h3>Recent Registration Records</h3>
            <div class="registrations-list">
                ${this.registrations.map(reg => `
                    <div class="registration-card">
                        <div class="registration-header">
                            <div class="registration-name">${reg.full_name}</div>
                            <div class="registration-date">${formatDate(reg.registration_date, { month: 'short', day: 'numeric' })}</div>
                        </div>
                        <div class="registration-details">
                            <div class="registration-detail">
                                <span class="detail-label">Email</span>
                                <span class="detail-value">${reg.email}</span>
                            </div>
                            <div class="registration-detail">
                                <span class="detail-label">Tickets</span>
                                <span class="detail-value">${reg.ticket_count}</span>
                            </div>
                            ${reg.phone ? `
                            <div class="registration-detail">
                                <span class="detail-label">Phone</span>
                                <span class="detail-value">${reg.phone}</span>
                            </div>
                            ` : ''}
                        </div>
                        ${reg.special_requirements ? `
                        <div class="special-requirements">
                            <strong>Special Requirements:</strong> ${reg.special_requirements}
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    initWeatherWidget() {
        if (this.eventData && this.eventData.latitude && this.eventData.longitude) {
            // Store event data for weather component use
            window.currentEventData = this.eventData;
            
            this.weatherWidget = new WeatherWidget('weather-widget', {
                showForecast: true,
                autoUpdate: true
            });
        }
    }

    setupEventListeners() {
        // Share button
        const shareBtn = document.getElementById('share-event');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareEvent();
            });
        }
    }

    shareEvent() {
        if (navigator.share) {
            navigator.share({
                title: this.eventData.title,
                text: this.eventData.description,
                url: window.location.href,
            })
            .then(() => showMessage('Shared successfully', 'success'))
            .catch((error) => console.log('Share failed:', error));
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => showMessage('Link copied to clipboard', 'success'))
                .catch(() => showMessage('Copy failed, please manually copy the link', 'error'));
        }
    }

    showError(message) {
        const container = document.getElementById('event-details');
        if (!container) return;

        container.innerHTML = `
            <div class="card text-center">
                <h3>Loading Failed</h3>
                <p>${message}</p>
                <a href="events.html" class="btn btn-primary">Back to Events List</a>
            </div>
        `;
    }
}

// Initialize event details page
document.addEventListener('DOMContentLoaded', () => {
    new EventDetailsPage();
});