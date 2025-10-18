// Date formatting
function formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

// Relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 2592000) {
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
        return formatDate(dateString);
    }
}

// Currency formatting
function formatCurrency(amount, currency = 'AUD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}


function formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
}


function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}


function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}


function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


function showMessage(message, type = 'info', duration = 5000) {

    const existingMessage = document.querySelector('.global-message');
    if (existingMessage) {
        existingMessage.remove();
    }


    const messageDiv = document.createElement('div');
    messageDiv.className = `global-message alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(messageDiv);


    if (duration > 0) {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, duration);
    }

    return messageDiv;
}

// Dialog
function showConfirm(message, onConfirm, onCancel = null) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    const dialog = document.createElement('div');
    dialog.className = 'card';
    dialog.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    `;

    dialog.innerHTML = `
        <h3 style="margin-bottom: 1rem;">Confirm Action</h3>
        <p style="margin-bottom: 2rem;">${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
            <button class="btn btn-danger" id="confirm-ok">Confirm</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Events
    const handleConfirm = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
        overlay.remove();
        if (onCancel) onCancel();
    };

    dialog.querySelector('#confirm-ok').addEventListener('click', handleConfirm);
    dialog.querySelector('#confirm-cancel').addEventListener('click', handleCancel);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) handleCancel();
    });
}

// Page title
function setPageTitle(title) {
    document.title = `${title} - Charity Events`;
}


function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Update URL parameters
function updateUrlParams(params, replace = false) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, params[key]);
        }
    });

    if (replace) {
        window.history.replaceState({}, '', url);
    } else {
        window.history.pushState({}, '', url);
    }
}

// Export all helper functions
export {
    formatDate,
    formatRelativeTime,
    formatCurrency,
    formatNumber,
    formatPercentage,
    truncateText,
    debounce,
    throttle,
    showMessage,
    showConfirm,
    setPageTitle,
    getUrlParams,
    updateUrlParams
};