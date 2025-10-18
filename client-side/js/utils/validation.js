class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.fields = {};
        this.errors = {};
        
        if (this.form) {
            this.initialize();
        }
    }

    initialize() {
        // Find fields that need validation
        const inputs = this.form.querySelectorAll('[data-validation]');
        inputs.forEach(input => {
            const fieldName = input.name;
            this.fields[fieldName] = input;
            
            // Add event listeners
            input.addEventListener('blur', () => this.validateField(fieldName));
            input.addEventListener('input', () => this.clearFieldError(fieldName));
        });

        // Form submit event
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    addRule(fieldName, rule) {
        if (!this.fields[fieldName]) {
            console.warn(`Field ${fieldName} not found`);
            return;
        }

        const input = this.fields[fieldName];
        if (!input.dataset.validation) {
            input.dataset.validation = rule;
        } else {
            input.dataset.validation += `,${rule}`;
        }
    }

    validateField(fieldName) {
        const input = this.fields[fieldName];
        if (!input) return true;

        const value = input.value.trim();
        const rules = input.dataset.validation?.split(',') || [];
        let isValid = true;

        // Clear previous errors
        this.clearFieldError(fieldName);

        for (const rule of rules) {
            const [ruleName, ruleParam] = rule.split(':');
            
            switch (ruleName) {
                case 'required':
                    if (!value) {
                        this.showError(fieldName, 'This field is required');
                        isValid = false;
                    }
                    break;

                case 'email':
                    if (value && !this.isValidEmail(value)) {
                        this.showError(fieldName, 'Please enter a valid email address');
                        isValid = false;
                    }
                    break;

                case 'minLength':
                    if (value && value.length < parseInt(ruleParam)) {
                        this.showError(fieldName, `Minimum ${ruleParam} characters required`);
                        isValid = false;
                    }
                    break;

                case 'maxLength':
                    if (value && value.length > parseInt(ruleParam)) {
                        this.showError(fieldName, `Cannot exceed ${ruleParam} characters`);
                        isValid = false;
                    }
                    break;

                case 'number':
                    if (value && isNaN(value)) {
                        this.showError(fieldName, 'Please enter a valid number');
                        isValid = false;
                    }
                    break;

                case 'min':
                    if (value && parseFloat(value) < parseFloat(ruleParam)) {
                        this.showError(fieldName, `Value cannot be less than ${ruleParam}`);
                        isValid = false;
                    }
                    break;

                case 'max':
                    if (value && parseFloat(value) > parseFloat(ruleParam)) {
                        this.showError(fieldName, `Value cannot be greater than ${ruleParam}`);
                        isValid = false;
                    }
                    break;
            }

            if (!isValid) break;
        }

        if (isValid) {
            this.showSuccess(fieldName);
        }

        return isValid;
    }

    validateForm() {
        let isValid = true;
        
        for (const fieldName in this.fields) {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        }

        return isValid;
    }

    showError(fieldName, message) {
        const input = this.fields[fieldName];
        input.classList.add('error');
        
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        this.errors[fieldName] = message;
    }

    showSuccess(fieldName) {
        const input = this.fields[fieldName];
        input.classList.remove('error');
        
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        delete this.errors[fieldName];
    }

    clearFieldError(fieldName) {
        const input = this.fields[fieldName];
        if (input) {
            input.classList.remove('error');
            const errorElement = input.parentNode.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
            delete this.errors[fieldName];
        }
    }

    clearAllErrors() {
        for (const fieldName in this.fields) {
            this.clearFieldError(fieldName);
        }
        this.errors = {};
    }

    handleSubmit(e) {
        if (!this.validateForm()) {
            e.preventDefault();
            this.showFormError('Please correct the errors in the form');
        }
    }

    showFormError(message) {
        // Remove previous form errors
        const existingError = this.form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new form error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error form-error';
        errorDiv.textContent = message;
        
        this.form.insertBefore(errorDiv, this.form.firstChild);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getErrors() {
        return this.errors;
    }

    isValid() {
        return Object.keys(this.errors).length === 0;
    }
}

export { FormValidator };