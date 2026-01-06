// Main Application Controller
class MyEventsApp {
    constructor() {
        this.components = {};
        this.apiBaseUrl = '../backend/api'; // Base URL for API calls
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadComponents();
        this.setupGlobalEventListeners();
        this.checkUserSession();
    }

    loadComponents() {
        // Initialize components based on current page
        const path = window.location.pathname;
        
        if (path.includes('index.html') || path.endsWith('/')) {
            this.components.eventManager = new EventManager();
            this.components.parallax = new ParallaxEffect('.parallax');
        }
        
        if (path.includes('budget-calculator.html')) {
            this.components.budgetCalculator = new BudgetCalculator();
        }
        
        // Add login/logout functionality
        this.setupAuth();
    }

    // Check if user is logged in from localStorage
    checkUserSession() {
        const userData = localStorage.getItem('myevents_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    setupAuth() {
        // Check if user is logged in
        const user = localStorage.getItem('myevents_user');
        if (user) {
            this.showUserMenu(JSON.parse(user));
        } else {
            this.showLoginButton();
        }
    }

    showUserMenu(user) {
        // Create user menu UI
        const nav = document.querySelector('nav ul');
        if (!nav) return;
        
        // Remove existing user menu if any
        const existingUserMenu = document.getElementById('user-menu');
        if (existingUserMenu) {
            existingUserMenu.remove();
        }
        
        const userMenu = document.createElement('li');
        userMenu.id = 'user-menu';
        userMenu.innerHTML = `
            <a href="#" class="user-toggle">${user.name} ▼</a>
            <div class="user-dropdown">
                <a href="#">My Registrations</a>
                <a href="#" id="logout-btn">Logout</a>
            </div>
        `;
        
        nav.appendChild(userMenu);
        
        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('myevents_user');
            window.location.reload();
        });
    }

    showLoginButton() {
        const nav = document.querySelector('nav ul');
        if (!nav) return;
        
        // Remove existing user menu if any
        const existingUserMenu = document.getElementById('user-menu');
        if (existingUserMenu) {
            existingUserMenu.remove();
        }
        
        const loginItem = document.createElement('li');
        loginItem.id = 'user-menu';
        loginItem.innerHTML = '<a href="#" id="login-btn">Login / Register</a>';
        nav.appendChild(loginItem);
        
        // Add login functionality
        document.getElementById('login-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });
    }

    showLoginModal() {
        // Create login modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Login to EventsX</h2>
                <form id="login-form">
                    <label for="login-email">Email:</label>
                    <input type="email" id="login-email" required>
                    
                    <label for="login-password">Password:</label>
                    <input type="password" id="login-password" required>
                    
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="#" id="switch-to-register">Register</a></p>
                
                <form id="register-form" style="display: none;">
                    <label for="register-name">Full Name:</label>
                    <input type="text" id="register-name" required>
                    
                    <label for="register-email">Email:</label>
                    <input type="email" id="register-email" required>
                    
                    <label for="register-password">Password:</label>
                    <input type="password" id="register-password" required>
                    
                    <label for="register-phone">Phone Number:</label>
                    <input type="tel" id="register-phone" required placeholder="01XXXXXXXXX">
                    
                    <button type="submit">Register</button>
                </form>
                <p id="switch-to-login" style="display: none;">Already have an account? <a href="#" id="switch-to-login-link">Login</a></p>
                <div id="auth-message" style="margin-top: 1rem; color: red; display: none;"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal functionality
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
            document.querySelector('#switch-to-register').parentElement.style.display = 'none';
            document.getElementById('switch-to-login').style.display = 'block';
            document.getElementById('auth-message').style.display = 'none';
        });
        
        modal.querySelector('#switch-to-login-link').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('switch-to-login').style.display = 'none';
            document.querySelector('#switch-to-register').parentElement.style.display = 'block';
            document.getElementById('auth-message').style.display = 'none';
        });
        
        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            });
        });
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister({
                name: document.getElementById('register-name').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
                phone: document.getElementById('register-phone').value
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Handle login with PHP API
    async handleLogin(credentials) {
        const messageDiv = document.getElementById('auth-message');
        
        try {
            // Determine correct API path
            const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
            const apiUrl = isIndexPage ? 'backend/api/login.php' : '../backend/api/login.php';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem('myevents_user', JSON.stringify(data.data));
                
                // Close modal and reload page
                document.querySelector('.modal').remove();
                window.location.reload();
            } else {
                // Show error message
                messageDiv.textContent = data.message;
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.style.display = 'block';
        }
    }

    // Handle registration with PHP API
    async handleRegister(userData) {
        const messageDiv = document.getElementById('auth-message');
        
        try {
            // Determine correct API path
            const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
            const apiUrl = isIndexPage ? 'backend/api/register.php' : '../backend/api/register.php';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem('myevents_user', JSON.stringify(data.data));
                
                // Close modal and reload page
                document.querySelector('.modal').remove();
                window.location.reload();
            } else {
                // Show error message
                messageDiv.textContent = data.message;
                messageDiv.style.display = 'block';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Registration error:', error);
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.style.display = 'block';
        }
    }

    setupGlobalEventListeners() {
        // Global escape key handler to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => modal.remove());
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MyEventsApp();
});