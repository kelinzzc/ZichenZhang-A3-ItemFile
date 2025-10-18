import { apiClient } from './utils/api.js';
import { showMessage, setPageTitle, formatDate, formatCurrency, debounce } from './utils/helpers.js';

class EventsPage {
    constructor() {
        this.currentPage = 1;
        this.limit = 9;
        this.totalPages = 1;
        this.isLoading = false;
        this.filters = {
            category: '',
            location: '',
            date_from: '',
            date_to: ''
        };

        this.initialize();
    }

    async initialize() {
        setPageTitle('Events List');
        this.setupEventListeners();
        await this.loadCategories();
        await this.loadEvents();
    }

    setupEventListeners() {
        // Filter form
        const filterForm = document.getElementById('event-filters');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFilterSubmit();
            });

            // Input debouncing
            const locationInput = filterForm.querySelector('#location');
            if (locationInput) {
                locationInput.addEventListener('input', debounce(() => {
                    this.handleFilterSubmit();
                }, 500));
            }
        }

        // Reset filters
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Pagination buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.handlePageChange(page);
                }
            }
        });

        // Infinite scroll (optional)
        window.addEventListener('scroll', debounce(() => {
            this.handleScroll();
        }, 200));
    }

    async loadCategories() {
        try {
            const response = await apiClient.getCategories();
            if (response.success) {
                this.renderCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    renderCategories(categories) {
        const select = document.getElementById('category');
        if (!select) return;

        select.innerHTML = '<option value="">All Categories</option>' +
            categories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
    }

    async loadEvents() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const params = {
                page: this.currentPage,
                limit: this.limit,
                ...this.filters
            };

            // Clean empty parameters
            Object.keys(params).forEach(key => {
                if (!params[key]) {
                    delete params[key];
                }
            });

            const response = await apiClient.getEvents(params);

            if (response.success) {
                this.renderEvents(response.data);
                this.updatePagination(response.pagination);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
            showMessage('Failed to load events list', 'error');
            this.renderError();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderEvents(events) {
        const container = document.getElementById('events-container');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card text-center">
                        <h3>No Events Available</h3>
                        <p>No events found matching your filter criteria</p>
                        <button class="btn btn-primary" onclick="eventsPage.resetFilters()">Reset Filters</button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = events.map(event => `
            <div class="col">
                <div class="event-card">
                    <img src="${event.image_url || '/images/event-default.jpg'}" 
                         alt="${event.title}" 
                         class="event-image"
                         onerror="this.src='/images/event-default.jpg'">
                    <div class="event-content">
                        <span class="event-category">${event.category_name || 'Uncategorized'}</span>
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-description">${event.description}</p>
                        <div class="event-meta">
                            <div class="event-date">
                                <i class="far fa-calendar"></i>
                                ${formatDate(event.event_date, { month: 'short', day: 'numeric' })}
                            </div>
                            <div class="event-location">
                                <i class="far fa-map-marker-alt"></i>
                                ${event.location}
                            </div>
                        </div>
                        <div class="event-footer">
                            <div class="event-price">
                                ${event.ticket_price === 0 ? 'Free' : formatCurrency(event.ticket_price)}
                            </div>
                            <a href="event-details.html?id=${event.id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updatePagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container) return;

        if (!pagination || pagination.total <= this.limit) {
            container.innerHTML = '';
            return;
        }

        this.totalPages = Math.ceil(pagination.total / this.limit);
        let html = '';

        // Previous page
        if (this.currentPage > 1) {
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
            </li>`;
        }

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === this.currentPage) {
                html += `<li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>`;
            } else {
                html += `<li class="page-item">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`;
            }
        }

        // Next page
        if (this.currentPage < this.totalPages) {
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
            </li>`;
        }

        container.innerHTML = html;
    }

    handleFilterSubmit() {
        const form = document.getElementById('event-filters');
        if (!form) return;

        const formData = new FormData(form);
        this.filters = {
            category: formData.get('category') || '',
            location: formData.get('location') || '',
            date_from: formData.get('date_from') || '',
            date_to: formData.get('date_to') || ''
        };

        this.currentPage = 1;
        this.loadEvents();
    }

    resetFilters() {
        const form = document.getElementById('event-filters');
        if (form) {
            form.reset();
        }

        this.filters = {
            category: '',
            location: '',
            date_from: '',
            date_to: ''
        };

        this.currentPage = 1;
        this.loadEvents();
    }

    handlePageChange(page) {
        this.currentPage = page;
        this.loadEvents();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleScroll() {
        // Simple infinite scroll implementation
        if (this.isLoading || this.currentPage >= this.totalPages) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 100) {
            this.currentPage++;
            this.loadEvents(true); // Could modify loadEvents to support append mode
        }
    }

    showLoading() {
        let loader = document.getElementById('loading-indicator');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loading-indicator';
            loader.className = 'loading';
            loader.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
            document.getElementById('events-container').after(loader);
        }
        loader.style.display = 'block';
    }

    hideLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    renderError() {
        const container = document.getElementById('events-container');
        if (!container) return;

        container.innerHTML = `
            <div class="col-12">
                <div class="card text-center">
                    <h3>Loading Failed</h3>
                    <p>Unable to load events list, please try again later</p>
                    <button class="btn btn-primary" onclick="eventsPage.loadEvents()">Reload</button>
                </div>
            </div>
        `;
    }
}

// Initialize events list page
let eventsPage;
document.addEventListener('DOMContentLoaded', () => {
    eventsPage = new EventsPage();
});