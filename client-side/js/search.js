import { apiClient } from './utils/api.js';
import { showMessage, setPageTitle, formatDate, formatCurrency, getUrlParams, debounce } from './utils/helpers.js';

class SearchPage {
    constructor() {
        this.currentPage = 1;
        this.limit = 12;
        this.totalPages = 1;
        this.isLoading = false;
        this.searchQuery = '';
        this.filters = {
            category: '',
            location: '',
            date_from: '',
            date_to: ''
        };

        this.initialize();
    }

    initialize() {
        this.parseUrlParams();
        this.setupEventListeners();
        this.performSearch();
    }

    parseUrlParams() {
        const params = getUrlParams();
        
        this.searchQuery = params.q || '';
        this.filters.category = params.category || '';
        this.filters.location = params.location || '';
        this.filters.date_from = params.date_from || '';
        this.filters.date_to = params.date_to || '';

        // Update search input
        const searchInput = document.getElementById('search-input');
        if (searchInput && this.searchQuery) {
            searchInput.value = this.searchQuery;
        }

        // Update filter form
        this.updateFilterForm();
    }

    updateFilterForm() {
        const form = document.getElementById('search-filters');
        if (!form) return;

        Object.keys(this.filters).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && this.filters[key]) {
                input.value = this.filters[key];
            }
        });
    }

    setupEventListeners() {
        // Search form
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearchSubmit();
            });
        }

        // Real-time search (debounced)
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.handleSearchInput();
            }, 500));
        }

        // Filter form
        const filterForm = document.getElementById('search-filters');
        if (filterForm) {
            filterForm.addEventListener('change', () => {
                this.handleFilterChange();
            });
        }

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.handlePageChange(page);
                }
            }
        });
    }

    handleSearchSubmit() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.searchQuery = searchInput.value.trim();
            this.currentPage = 1;
            this.updateUrl();
            this.performSearch();
        }
    }

    handleSearchInput() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.searchQuery = searchInput.value.trim();
            this.currentPage = 1;
            this.performSearch();
        }
    }

    handleFilterChange() {
        const form = document.getElementById('search-filters');
        if (!form) return;

        const formData = new FormData(form);
        this.filters = {
            category: formData.get('category') || '',
            location: formData.get('location') || '',
            date_from: formData.get('date_from') || '',
            date_to: formData.get('date_to') || ''
        };

        this.currentPage = 1;
        this.updateUrl();
        this.performSearch();
    }

    handlePageChange(page) {
        this.currentPage = page;
        this.performSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateUrl() {
        const params = {
            q: this.searchQuery,
            ...this.filters
        };

        // Clean empty parameters
        Object.keys(params).forEach(key => {
            if (!params[key]) {
                delete params[key];
            }
        });

        const queryString = new URLSearchParams(params).toString();
        const newUrl = `${window.location.pathname}?${queryString}`;
        window.history.replaceState({}, '', newUrl);
    }

    async performSearch() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const params = {
                q: this.searchQuery,
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

            const response = await apiClient.searchEvents(this.searchQuery, params);

            if (response.success) {
                this.renderSearchResults(response.data);
                this.updateSearchStats(response.data.length, response.pagination);
                this.updatePagination(response.pagination);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Search failed:', error);
            showMessage('Search failed, please try again later', 'error');
            this.renderError();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderSearchResults(events) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card text-center">
                        <h3>No related events found</h3>
                        <p>Please try adjusting your search keywords or filter conditions</p>
                        <div class="suggestions">
                            <p>Suggestions:</p>
                            <ul>
                                <li>Check if spelling is correct</li>
                                <li>Try more general keywords</li>
                                <li>Adjust filter conditions</li>
                            </ul>
                        </div>
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

    updateSearchStats(resultCount, pagination) {
        const statsElement = document.getElementById('search-stats');
        if (!statsElement) return;

        const total = pagination?.total || resultCount;
        const start = (this.currentPage - 1) * this.limit + 1;
        const end = Math.min(this.currentPage * this.limit, total);

        let statsHTML = `Found ${total} related events`;
        if (total > 0) {
            statsHTML += ` (showing ${start}-${end})`;
        }

        statsElement.textContent = statsHTML;
    }

    updatePagination(pagination) {
        const container = document.getElementById('search-pagination');
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

    showLoading() {
        let loader = document.getElementById('search-loading');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'search-loading';
            loader.className = 'loading';
            loader.innerHTML = '<div class="spinner"></div><p>Searching...</p>';
            document.getElementById('search-results').after(loader);
        }
        loader.style.display = 'block';
    }

    hideLoading() {
        const loader = document.getElementById('search-loading');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    renderError() {
        const container = document.getElementById('search-results');
        if (!container) return;

        container.innerHTML = `
            <div class="col-12">
                <div class="card text-center">
                    <h3>Search Failed</h3>
                    <p>Unable to complete search, please try again later</p>
                    <button class="btn btn-primary" onclick="searchPage.performSearch()">Search Again</button>
                </div>
            </div>
        `;
    }
}

// Initialize search page
let searchPage;
document.addEventListener('DOMContentLoaded', () => {
    searchPage = new SearchPage();
});