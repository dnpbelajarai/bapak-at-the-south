/* ============================================
   Bapak at the South - Main JavaScript
   Handles navigation, animations, and interactions
   ============================================ */

// ============================================
// WAIT FOR DOM TO LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all functions
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
    initNewsletterForm();
    
    console.log('🎉 Bapak at the South website loaded successfully!');
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle active class on menu
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = navMenu.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// ============================================
// SMOOTH SCROLLING
// ============================================
function initSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Get navbar height for offset
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                
                // Calculate position
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// SCROLL ANIMATIONS (AOS - Animate On Scroll)
// ============================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    if (animatedElements.length === 0) return;
    
    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class
                entry.target.classList.add('aos-animate');
                
                // Optional: Stop observing after animation
                // observer.unobserve(entry.target);
            } else {
                // Remove animation class when out of view (for repeat animations)
                entry.target.classList.remove('aos-animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all animated elements
    animatedElements.forEach(element => {
        // Apply delay if specified
        const delay = element.getAttribute('data-aos-delay');
        if (delay) {
            element.style.transitionDelay = delay + 'ms';
        }
        
        observer.observe(element);
    });
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Optional: Hide navbar on scroll down, show on scroll up
        // Uncomment below to enable this feature
        /*
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        */
        
        lastScroll = currentScroll;
    });
}

// ============================================
// NEWSLETTER FORM - mailto: VERSION
// ============================================
function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('subscriberEmail');
        const email = emailInput.value;
        
        // Basic email validation
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Create mailto link with subscriber's email in the body
        const yourEmail = 'dnpbelajarai@outlook.com'; // GANTI DENGAN EMAIL ANDA!
        const subject = 'New Articles Notification Request';
        const body = `Hello,%0D%0A%0D%0AI would like to get notified with new articles published on your website.%0D%0A%0D%0AMy email: ${email}%0D%0A%0D%0AThank you!`;
        
        const mailtoLink = `mailto:${yourEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Reset form after a short delay
        setTimeout(() => {
            emailInput.value = '';
            alert('Email client opened! Please send the email to subscribe.');
        }, 500);
    });
}

// ============================================
// EMAIL VALIDATION
// ============================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#50C878' : type === 'error' ? '#E74C3C' : '#4A90E2'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations to page
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// LAZY LOADING IMAGES (Optional Enhancement)
// ============================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// ACTIVE NAVIGATION LINK
// ============================================
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// BACK TO TOP BUTTON (Optional)
// ============================================
function initBackToTop() {
    // Create back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #9B59B6 0%, #4A90E2 100%);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(backToTopButton);
    
    // Show/hide button based on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTopButton.addEventListener('mouseenter', () => {
        backToTopButton.style.transform = 'translateY(-5px)';
        backToTopButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
    });
    
    backToTopButton.addEventListener('mouseleave', () => {
        backToTopButton.style.transform = 'translateY(0)';
        backToTopButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
}

// Initialize back to top button
initBackToTop();

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Debounce function for scroll events
function debounce(func, wait = 10) {
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

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================
console.log('%c🏠 Welcome to Bapak at the South! ', 'background: linear-gradient(135deg, #9B59B6 0%, #4A90E2 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%cWebsite built with ❤️ and modern web technologies', 'color: #666; font-size: 12px;');
console.log('%cInterested in the code? Check out the repository!', 'color: #4A90E2; font-size: 12px;');

// ============================================
// EXPORT FUNCTIONS (for use in other scripts)
// ============================================
window.BapakattheSouth = {
    showNotification: showNotification,
    isValidEmail: isValidEmail
};

// Made with Bob
