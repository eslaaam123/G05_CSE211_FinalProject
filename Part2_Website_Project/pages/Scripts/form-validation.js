// ES6 Class for Form Validation
class FormValidator {
    constructor(formId) {
        this.form = document.querySelector('form');
        if (!this.form) {
            console.error('Form not found!');
            return;
        }
        
        this.fields = {
            name: this.form.querySelector('#name'),
            email: this.form.querySelector('#email'),
            phone: this.form.querySelector('#phone'),
            event: this.form.querySelector('#event'),
            tickets: this.form.querySelector('#tickets'),
            notes: this.form.querySelector('#notes')
        };
        
        this.errors = {};
        this.isSubmitting = false; // Flag to prevent double submission
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEventsDropdown();
        this.preselectEventFromURL();
        this.checkUserLogin();
    }

    // Check if user is logged in
    checkUserLogin() {
        const userData = localStorage.getItem('myevents_user');
        if (userData) {
            const user = JSON.parse(userData);
            // Pre-fill user data
            if (this.fields.name) this.fields.name.value = user.name || '';
            if (this.fields.email) this.fields.email.value = user.email || '';
            if (this.fields.phone) this.fields.phone.value = user.phone || '';
            
            // Make fields readonly if user is logged in
            if (this.fields.name) this.fields.name.readOnly = true;
            if (this.fields.email) this.fields.email.readOnly = true;
            if (this.fields.phone) this.fields.phone.readOnly = true;
        }
    }

    // Load events from API into dropdown
    async loadEventsDropdown() {
        try {
            const apiUrl = '../backend/api/get_events.php';
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            console.log('Events loaded:', data);
            
            if (data.success && data.data.length > 0) {
                const eventSelect = this.fields.event;
                
                // Clear existing options except the first one
                eventSelect.innerHTML = '<option value="">-- Select an event --</option>';
                
                // Add events from database
                data.data.forEach(event => {
                    const option = document.createElement('option');
                    option.value = event.id;
                    option.textContent = `${event.name} - ${event.cost} EGP`;
                    option.setAttribute('data-event-name', event.name);
                    option.setAttribute('data-event-cost', event.cost);
                    eventSelect.appendChild(option);
                });
            } else {
                console.error('No events found or failed to load events');
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    // Pre-select event if coming from URL parameter
    preselectEventFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event');
        if (eventId && this.fields.event) {
            // Wait a bit for events to load then select
            setTimeout(() => {
                this.fields.event.value = eventId;
                console.log('Pre-selected event:', eventId);
            }, 500);
        }
    }

    setupEventListeners() {
        // Validate on input change
        Object.values(this.fields).forEach(field => {
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearError(field));
            }
        });

        // Validate on form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            e.stopPropagation(); // Stop event from bubbling up
            
            console.log('Form submitted!');
            
            // Check if already submitting
            if (this.isSubmitting) {
                console.log('Already submitting, ignoring duplicate submission');
                return false;
            }
            
            if (this.validateForm()) {
                this.submitRegistration();
            } else {
                this.showAllErrors();
                alert('Please fill all required fields correctly.');
            }
            
            return false;
        });
    }

    validateField(field) {
        if (!field) return true;
        
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch(field.id) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;
                
            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'phone':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Phone number is required';
                } else if (!this.isValidEgyptianPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid Egyptian phone number (01XXXXXXXXX)';
                }
                break;
                
            case 'event':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please select an event';
                }
                break;
                
            case 'tickets':
                if (!value || parseInt(value) < 1) {
                    isValid = false;
                    errorMessage = 'Please enter a valid number of tickets';
                }
                break;
        }

        if (!isValid) {
            this.showError(field, errorMessage);
        } else {
            this.clearError(field);
        }

        return isValid;
    }

    validateForm() {
        let isValid = true;
        
        // Validate all required fields
        ['name', 'email', 'phone', 'event', 'tickets'].forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // Submit registration to PHP API
    async submitRegistration() {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log('Already submitting, please wait...');
            return;
        }
        
        this.isSubmitting = true;
        
        // Check if user is logged in
        const userData = localStorage.getItem('myevents_user');
        
        if (!userData) {
            alert('Please login or register first to complete your booking.');
            this.isSubmitting = false;
            // Redirect to home page to login
            window.location.href = '../index.html';
            return;
        }
        
        const user = JSON.parse(userData);
        
        // Validate user data
        if (!user.id) {
            alert('User session invalid. Please login again.');
            localStorage.removeItem('myevents_user');
            this.isSubmitting = false;
            window.location.href = '../index.html';
            return;
        }
        
        // Get form values
        const eventId = parseInt(this.fields.event.value);
        const tickets = parseInt(this.fields.tickets.value);
        const notes = this.fields.notes ? this.fields.notes.value.trim() : '';
        
        // Validate event and tickets
        if (!eventId || eventId <= 0) {
            alert('Please select a valid event.');
            this.isSubmitting = false;
            return;
        }
        
        if (!tickets || tickets < 1) {
            alert('Please enter a valid number of tickets.');
            this.isSubmitting = false;
            return;
        }
        
        // Prepare registration data
        const registrationData = {
            user_id: parseInt(user.id),
            event_id: eventId,
            tickets: tickets,
            notes: notes
        };
        
        console.log('Sending registration data:', registrationData);
        
        // Disable submit button to prevent double submission
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        try {
            const apiUrl = '../backend/api/register_event.php';
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
            
            console.log('Response status:', response.status);
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                console.error('Response was:', responseText);
                throw new Error('Invalid response from server');
            }
            
            console.log('Response data:', data);
            
            if (data.success) {
                // Show success message
                alert(`Registration successful!\n\nEvent: ${data.data.event_name}\nTickets: ${data.data.tickets}\nTotal Cost: ${data.data.total_cost} EGP`);
                
                // Redirect to thank you page
                window.location.href = 'thank-you.html';
            } else {
                // Show error message
                alert('Registration failed: ' + (data.message || 'Unknown error'));
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                this.isSubmitting = false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please check:\n1. You are logged in\n2. You selected an event\n3. Your internet connection\n\nError: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            this.isSubmitting = false;
        }
    }

    showError(field, message) {
        this.clearError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = 'red';
        
        this.errors[field.id] = errorDiv;
    }

    clearError(field) {
        if (this.errors[field.id]) {
            this.errors[field.id].remove();
            delete this.errors[field.id];
        }
        field.style.borderColor = '';
    }

    showAllErrors() {
        Object.values(this.fields).forEach(field => {
            if (field && field.id !== 'notes') { // notes is optional
                this.validateField(field);
            }
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidEgyptianPhone(phone) {
        // Egyptian phone number validation (01X XXXXXXX)
        const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
}

// Initialize FormValidator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing form validator...');
    const validator = new FormValidator();
});