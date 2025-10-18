import { apiClient } from './utils/api.js';
import { showMessage, setPageTitle, formatDate, formatCurrency, getUrlParams } from './utils/helpers.js';
import { FormValidator } from './utils/validation.js';

class RegisterPage {
    constructor() {
        this.eventId = this.getEventIdFromUrl();
        this.eventData = null;
        this.formValidator = null;

        this.initialize();
    }

    getEventIdFromUrl() {
        const urlParams = getUrlParams();
        return urlParams.event_id;
    }

    async initialize() {
        if (!this.eventId) {
            this.showError('Invalid event ID');
            return;
        }

        await this.loadEventDetails();
        this.initFormValidation();
        this.setupEventListeners();
    }

    async loadEventDetails() {
        try {
            const response = await apiClient.getEventById(this.eventId);
            
            if (response.success) {
                this.eventData = response.data.event;
                this.renderEventInfo();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Failed to load event details:', error);
            this.showError('Failed to load event information');
        }
    }

    renderEventInfo() {
        if (!this.eventData) return;

        setPageTitle(`Register - ${this.eventData.title}`);

        const container = document.getElementById('event-info');
        if (!container) return;

        container.innerHTML = `
            <div class="card">
                <div class="row">
                    <div class="col-3">
                        <img src="${this.eventData.image_url || '/images/event-default.jpg'}" 
                             alt="${this.eventData.title}" 
                             class="event-image"
                             onerror="this.src='/images/event-default.jpg'">
                    </div>
                    <div class="col-9">
                        <h2>${this.eventData.title}</h2>
                        <div class="event-meta">
                            <div class="meta-item">
                                <strong>Date:</strong> ${formatDate(this.eventData.event_date)}
                            </div>
                            <div class="meta-item">
                                <strong>Location:</strong> ${this.eventData.location}
                            </div>
                            <div class="meta-item">
                                <strong>Ticket Price:</strong> ${this.eventData.ticket_price === 0 ? 'Free' : formatCurrency(this.eventData.ticket_price)}
                            </div>
                        </div>
                        <p class="event-description">${this.eventData.description}</p>
                    </div>
                </div>
            </div>
        `;
    }

    initFormValidation() {
        this.formValidator = new FormValidator('registration-form');
        
        // Add custom validation rules
        this.formValidator.addRule('ticket_count', 'required');
        this.formValidator.addRule('ticket_count', 'number');
        this.formValidator.addRule('ticket_count', 'min:1');
        
        this.formValidator.addRule('full_name', 'required');
        this.formValidator.addRule('full_name', 'minLength:2');
        
        this.formValidator.addRule('email', 'required');
        this.formValidator.addRule('email', 'email');
        
        this.formValidator.addRule('phone', 'required');
    }

    setupEventListeners() {
        const form = document.getElementById('registration-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Update total price when ticket count changes
        const ticketCountInput = document.getElementById('ticket_count');
        if (ticketCountInput) {
            ticketCountInput.addEventListener('change', () => {
                this.updateTotalPrice();
            });
        }
    }

    updateTotalPrice() {
        if (!this.eventData) return;

        const ticketCountInput = document.getElementById('ticket_count');
        const totalPriceElement = document.getElementById('total-price');
        
        if (!ticketCountInput || !totalPriceElement) return;

        const ticketCount = parseInt(ticketCountInput.value) || 0;
        const totalPrice = ticketCount * this.eventData.ticket_price;

        totalPriceElement.textContent = formatCurrency(totalPrice);
    }

    async handleFormSubmit() {
        if (!this.formValidator.validateForm()) {
            showMessage('Please correct errors in the form', 'error');
            return;
        }

        const formData = new FormData(document.getElementById('registration-form'));
        const registrationData = {
            event_id: this.eventId,
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            ticket_count: parseInt(formData.get('ticket_count')),
            special_requirements: formData.get('special_requirements') || ''
        };

        try {
            this.setFormLoading(true);

            const response = await apiClient.createRegistration(registrationData);

            if (response.success) {
                showMessage('Registration successful!', 'success');
                this.showConfirmation(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            
            if (error.message.includes('already registered')) {
                showMessage('You have already registered for this event', 'error');
            } else if (error.message.includes('insufficient tickets')) {
                showMessage('Insufficient tickets available', 'error');
            } else {
                showMessage('Registration failed: ' + error.message, 'error');
            }
        } finally {
            this.setFormLoading(false);
        }
    }

    showConfirmation(registration) {
        const formContainer = document.getElementById('registration-form-container');
        if (!formContainer) return;

        formContainer.innerHTML = `
            <div class="card text-center">
                <div class="alert alert-success">
                    <h3>Registration Successful!</h3>
                </div>
                
                <div class="confirmation-details">
                    <h4>Registration Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <strong>Registration ID:</strong> #${registration.id}
                        </div>
                        <div class="detail-item">
                            <strong>Name:</strong> ${registration.full_name}
                        </div>
                        <div class="detail-item">
                            <strong>Email:</strong> ${registration.email}
                        </div>
                        <div class="detail-item">
                            <strong>Tickets:</strong> ${registration.ticket_count}
                        </div>
                        <div class="detail-item">
                            <strong>Event:</strong> ${this.eventData.title}
                        </div>
                        <div class="detail-item">
                            <strong>Date:</strong> ${formatDate(this.eventData.event_date)}
                        </div>
                    </div>
                </div>
                
                <div class="confirmation-actions">
                    <a href="event-details.html?id=${this.eventId}" class="btn btn-primary">View Event Details</a>
                    <a href="events.html" class="btn btn-outline">Browse More Events</a>
                </div>
                
                <div class="confirmation-note">
                    <p>We have sent a confirmation email to your inbox, please check.</p>
                </div>
            </div>
        `;
    }

    setFormLoading(loading) {
        const submitBtn = document.querySelector('#registration-form button[type="submit"]');
        if (!submitBtn) return;

        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner-small"></div> Submitting...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Registration';
        }
    }

    showError(message) {
        const container = document.getElementById('registration-form-container');
        if (!container) return;

        container.innerHTML = `
            <div class="card text-center">
                <h3>Error</h3>
                <p>${message}</p>
                <a href="events.html" class="btn btn-primary">Back to Events List</a>
            </div>
        `;
    }
}

// Initialize registration page
document.addEventListener('DOMContentLoaded', () => {
    new RegisterPage();
});