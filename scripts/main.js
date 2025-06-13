document.addEventListener('DOMContentLoaded', function() {
    // Initialize page animations
    initializeAnimations();
    
    // Set up business card click handlers
    setupBusinessCardHandlers();
    
    // Add subtle parallax effect to floating elements
    setupParallaxEffect();
    
    // Add contact item hover effects
    setupContactEffects();
});

function initializeAnimations() {
    // Stagger animation for contact items
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.animation = `fadeInRight 0.6s ease-out ${0.3 + index * 0.1}s forwards`;
    });
    
    // Stagger animation for business cards
    const businessCards = document.querySelectorAll('.business-card');
    businessCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.animation = `fadeInUp 0.8s ease-out ${0.8 + index * 0.2}s forwards`;
        
        // Ensure cards remain visible after animation
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.animation = '';
        }, (0.8 + index * 0.2) * 1000 + 800);
    });
}

function setupBusinessCardHandlers() {
    const businessCards = document.querySelectorAll('.business-card');
    const overlay = document.querySelector('.transition-overlay');
    const transitionText = document.querySelector('.transition-text');
    const spinner = document.querySelector('.loading-spinner');
    
    businessCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            const business = this.dataset.business;
            const href = this.getAttribute('href');
            
            // Update transition text and spinner color based on business
            if (business === 'plumbing') {
                transitionText.textContent = 'Loading Plumbing Services...';
                spinner.style.borderTopColor = '#22c55e';
            } else {
                transitionText.textContent = 'Loading Videography Portfolio...';
                spinner.style.borderTopColor = '#f97316';
            }
            
            // Add custom transition effects
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.8';
            
            // Show transition overlay
            overlay.classList.add('active');
            
            // Navigate after animation
            setTimeout(() => {
                // In development, this would navigate to the Netlify subdirectory
                const baseUrl = window.location.hostname.includes('netlify.app') ? 
                    `https://${window.location.hostname}` : 
                    window.location.origin;
                window.location.href = `${baseUrl}${href}`;
            }, 600);
        });
        
        // Add hover sound effect simulation (visual feedback)
        card.addEventListener('mouseenter', function() {
            // Create a subtle scale pulse effect
            this.style.animation = 'cardPulse 0.3s ease-out';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.animation = '';
        });
    });
}

function setupParallaxEffect() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    window.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

function setupContactEffects() {
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const content = this.textContent.trim();
            
            // Add copy-to-clipboard functionality for contact info
            if (content.includes('@')) {
                // Email
                navigator.clipboard.writeText(content.split(' ')[1]).then(() => {
                    showNotification('Email copied to clipboard!');
                });
            } else if (content.includes('(')) {
                // Phone
                navigator.clipboard.writeText(content.split(' ').slice(1).join(' ')).then(() => {
                    showNotification('Phone number copied to clipboard!');
                });
            }
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            this.style.color = '#22c55e';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.color = '';
            }, 200);
        });
    });
}

function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #22c55e, #16a34a);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 2000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes cardPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // Enhance focus styles for accessibility
        const style = document.createElement('style');
        style.textContent = `
            .business-card:focus {
                outline: 2px solid #f97316;
                outline-offset: 4px;
            }
        `;
        document.head.appendChild(style);
    }
});

// Performance optimization: Debounce mouse move events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to parallax effect
const debouncedParallax = debounce(function(e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
    });
}, 16); // ~60fps

window.addEventListener('mousemove', debouncedParallax);