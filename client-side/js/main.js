import { apiClient } from './utils/api.js';
import { showMessage, setPageTitle, formatDate, formatCurrency } from './utils/helpers.js';

class MainApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        // Set up global error handling
        this.setupErrorHandling();

        // Initialize page-specific functions
        this.initPageSpecificFunctions();

        // Set up global event listeners
        this.setupGlobalEventListeners();

        console.log('Charity Events App initialized');
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            showMessage('An error occurred, please refresh the page and try again', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            showMessage('Request failed, please check your network connection', 'error');
            event.preventDefault();
        });
    }

    initPageSpecificFunctions() {
        const currentPage = this.getCurrentPage();

        switch (currentPage) {
            case 'index':
                this.initHomePage();
                break;
            case 'events':
                this.initEventsPage();
                break;
            case 'event-details':
                this.initEventDetailsPage();
                break;
            case 'register':
                this.initRegisterPage();
                break;
            case 'search':
                this.initSearchPage();
                break;
            default:
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
            return 'index';
        } else if (path.includes('events.html')) {
            return 'events';
        } else if (path.includes('event-details.html')) {
            return 'event-details';
        } else if (path.includes('register.html')) {
            return 'register';
        } else if (path.includes('search.html')) {
            return 'search';
        }
        return 'index';
    }

    initHomePage() {
        setPageTitle('Home');
        this.loadFeaturedEvents();
        this.loadEventStats();
    }

    initEventsPage() {
        setPageTitle('Events List');
        // Events list page initialization is handled in events.js
    }

    initEventDetailsPage() {
        setPageTitle('Event Details');
        // Event details page initialization is handled in event-details.js
    }

    initRegisterPage() {
        setPageTitle('Event Registration');
        // Registration page initialization is handled in register.js
    }

    initSearchPage() {
        setPageTitle('Search Events');
        // Search page initialization is handled in search.js
    }

    async loadFeaturedEvents() {
        try {
            const response = await apiClient.getEvents({ 
                limit: 6,
                page: 1
            });

            if (response.success) {
                this.renderFeaturedEvents(response.data);
            }
        } catch (error) {
            console.error('Failed to load featured events:', error);
        }
    }

    renderFeaturedEvents(events) {
        const container = document.getElementById('featured-events');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = '<p class="text-center">No featured events available</p>';
            return;
        }

        container.innerHTML = events.map(event => `
            <div class="col">
                <div class="event-card">
                    <img src="${event.image_url || '/images/event-default.jpg'}" alt="${event.title}" class="event-image">
                    <div class="event-content">
                        <span class="event-category">${event.category_name}</span>
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-description">${event.description}</p>
                        <div class="event-meta">
                            <div class="event-date">
                                <i class="far fa-calendar"></i>
                                ${new Date(event.event_date).toLocaleDateString('en-US')}
                            </div>
                            <div class="event-location">
                                <i class="far fa-map-marker-alt"></i>
                                ${event.location}
                            </div>
                        </div>
                        <div class="event-footer">
                            <div class="event-price">${event.ticket_price === 0 ? 'Free' : `$${event.ticket_price}`}</div>
                            <a href="event-details.html?id=${event.id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadEventStats() {
        try {
            const response = await apiClient.getEventStats();
            if (response.success) {
                this.renderEventStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load event stats:', error);
        }
    }

    renderEventStats(stats) {
        const container = document.getElementById('event-stats');
        if (!container) return;

        container.innerHTML = `
            <div class="col">
                <div class="card text-center">
                    <h3>${stats.total_events || 0}</h3>
                    <p>Total Events</p>
                </div>
            </div>
            <div class="col">
                <div class="card text-center">
                    <h3>${stats.total_registrations || 0}</h3>
                    <p>Total Registrations</p>
                </div>
            </div>
            <div class="col">
                <div class="card text-center">
                    <h3>${stats.total_tickets_sold || 0}</h3>
                    <p>Total Tickets</p>
                </div>
            </div>
            <div class="col">
                <div class="card text-center">
                    <h3>${stats.total_raised ? `$${stats.total_raised}` : '$0'}</h3>
                    <p>Total Raised</p>
                </div>
            </div>
        `;
    }

    setupGlobalEventListeners() {
        // Global search form handling
        const searchForm = document.getElementById('global-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchInput = searchForm.querySelector('input[name="q"]');
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            });
        }

        // Responsive menu handling
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    new MainApp();
});