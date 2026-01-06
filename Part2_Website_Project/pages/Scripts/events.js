// ES6 Class for Event Management
class EventManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.apiBaseUrl = 'backend/api'; // Base URL for API calls
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
    }

    // Load events from PHP API
    async loadEvents() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/get_events.php`);
            const data = await response.json();
            
            if (data.success) {
                this.events = data.data;
                this.filteredEvents = [...this.events];
                this.renderEvents();
            } else {
                console.error('Failed to load events:', data.message);
                this.showNoEventsMessage('Failed to load events. Please try again later.');
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.showNoEventsMessage('Failed to load events. Please check your connection.');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('input[type="text"][placeholder="Search events..."]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterEvents({
                    search: e.target.value,
                    category: document.querySelector('select').value,
                    date: document.querySelector('input[type="date"]').value
                });
            });
        }

        // Category filter
        const categoryFilter = document.querySelector('select');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterEvents({
                    search: document.querySelector('input[type="text"][placeholder="Search events..."]').value,
                    category: e.target.value,
                    date: document.querySelector('input[type="date"]').value
                });
            });
        }

        // Date filter
        const dateFilter = document.querySelector('input[type="date"]');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filterEvents({
                    search: document.querySelector('input[type="text"][placeholder="Search events..."]').value,
                    category: document.querySelector('select').value,
                    date: e.target.value
                });
            });
        }

        // Apply filters button
        const applyFiltersBtn = document.querySelector('button[type="submit"]');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterEvents({
                    search: document.querySelector('input[type="text"][placeholder="Search events..."]').value,
                    category: document.querySelector('select').value,
                    date: document.querySelector('input[type="date"]').value
                });
            });
        }
    }

    filterEvents(filters) {
        this.filteredEvents = this.events.filter(event => {
            let matches = true;
            
            // Search filter
            if (filters.search) {
                matches = matches && event.name.toLowerCase().includes(filters.search.toLowerCase());
            }
            
            // Category filter
            if (filters.category) {
                matches = matches && event.category === filters.category;
            }
            
            // Date filter
            if (filters.date) {
                matches = matches && event.date === filters.date;
            }
            
            return matches;
        });
        
        this.renderEvents();
    }

    renderEvents() {
        const eventsContainer = document.querySelector('.event-listings');
        if (!eventsContainer) return;
        
        // Keep the h2 title
        const title = eventsContainer.querySelector('h2');
        
        // Clear existing events
        eventsContainer.innerHTML = '';
        
        // Re-add the title
        if (title) {
            eventsContainer.appendChild(title);
        }
        
        // Render filtered events
        if (this.filteredEvents.length === 0) {
            this.showNoEventsMessage('No events found matching your criteria.');
            return;
        }
        
        this.filteredEvents.forEach(event => {
            const eventCard = this.createEventCard(event);
            eventsContainer.appendChild(eventCard);
        });
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        // Format date to readable format
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="event-content">
                <img src="${event.image}" alt="${event.name}" class="event-image" onerror="this.src='pages/images/default-event.jpg'">
                <div class="event-details">
                    <h3>${event.name}</h3>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Cost:</strong> ${event.cost} EGP</p>
                    ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                    <button class="register-btn" data-event-id="${event.id}">Register Now</button>
                </div>
            </div>
        `;
        
        // Add event listener to the register button
        const registerBtn = card.querySelector('.register-btn');
        registerBtn.addEventListener('click', () => {
            this.handleEventRegistration(event.id);
        });
        
        return card;
    }

    handleEventRegistration(eventId) {
        // Check if user is logged in
        const user = localStorage.getItem('myevents_user');
        
        if (!user) {
            // User not logged in, show login modal
            alert('Please login or register to book events.');
            document.getElementById('login-btn')?.click();
            return;
        }
        
        // Redirect to registration page with event pre-selected
        window.location.href = `pages/registration.html?event=${eventId}`;
    }

    showNoEventsMessage(message) {
        const eventsContainer = document.querySelector('.event-listings');
        if (!eventsContainer) return;
        
        const title = eventsContainer.querySelector('h2');
        eventsContainer.innerHTML = '';
        
        if (title) {
            eventsContainer.appendChild(title);
        }
        
        const noEvents = document.createElement('div');
        noEvents.className = 'no-events';
        noEvents.innerHTML = `<p>${message}</p>`;
        eventsContainer.appendChild(noEvents);
    }
}

// Initialize EventManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const eventManager = new EventManager();
});