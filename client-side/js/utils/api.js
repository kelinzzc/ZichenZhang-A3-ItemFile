const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // 事件相关API
    async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/events?${queryString}`);
    }

    async getEventById(id) {
        return this.request(`/events/${id}`);
    }

    async searchEvents(query, params = {}) {
        const searchParams = { q: query, ...params };
        const queryString = new URLSearchParams(searchParams).toString();
        return this.request(`/events/search?${queryString}`);
    }

    // 注册相关API
    async createRegistration(registrationData) {
        return this.request('/registrations', {
            method: 'POST',
            body: registrationData,
        });
    }

    async getEventRegistrations(eventId) {
        return this.request(`/registrations/event/${eventId}`);
    }

    // 分类相关API
    async getCategories() {
        return this.request('/categories');
    }

    // 组织相关API
    async getOrganizations() {
        return this.request('/organizations');
    }

    // 天气API
    async getWeather(latitude, longitude) {
        return this.request(`/weather?latitude=${latitude}&longitude=${longitude}`);
    }

    // 统计API
    async getEventStats() {
        return this.request('/events/stats');
    }
}


const apiClient = new ApiClient();


export { ApiClient, apiClient };