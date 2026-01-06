// ES6 Class for Parallax Effect
class ParallaxEffect {
    constructor(selector) {
        this.element = document.querySelector(selector);
        if (!this.element) return;
        
        this.intensity = 15;
        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollY = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.animate();
    }

    setupEventListeners() {
        // Mouse move effect
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) - 0.5;
            this.mouseY = (e.clientY / window.innerHeight) - 0.5;
        });

        // Scroll effect
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });

        // Reset on resize
        window.addEventListener('resize', () => {
            this.resetPosition();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.element) return;
        
        // Calculate movement based on mouse position and scroll
        const moveX = this.mouseX * this.intensity;
        const moveY = (this.mouseY * this.intensity) + (this.scrollY * 0.2);
        
        // Apply the transform
        this.element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    }

    resetPosition() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollY = window.scrollY;
    }
}

// Initialize ParallaxEffect when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const parallax = new ParallaxEffect('.parallax');
});