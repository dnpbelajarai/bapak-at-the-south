/* ============================================
   Shop Page JavaScript
   Handles product interactions and analytics
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initBuyButtons();
    initProductAnalytics();
    
    console.log('🛍️ Shop page loaded successfully!');
});

// ============================================
// BUY BUTTON TRACKING
// ============================================
function initBuyButtons() {
    const buyButtons = document.querySelectorAll('.buy-button');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Get product information
            const productCard = this.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            // Log to console (in production, send to analytics)
            console.log('Product clicked:', {
                title: productTitle,
                price: productPrice,
                timestamp: new Date().toISOString()
            });
            
            // Show notification
            if (window.BapakattheSouth && window.BapakattheSouth.showNotification) {
                window.BapakattheSouth.showNotification(
                    `Redirecting to secure payment for ${productTitle}...`,
                    'info'
                );
            }
            
            // Optional: Track with Google Analytics or other analytics service
            // gtag('event', 'purchase_intent', {
            //     'product_name': productTitle,
            //     'product_price': productPrice
            // });
        });
    });
}

// ============================================
// PRODUCT ANALYTICS
// ============================================
function initProductAnalytics() {
    // Track product views
    const productCards = document.querySelectorAll('.product-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const productTitle = entry.target.querySelector('.product-title').textContent;
                
                console.log('Product viewed:', productTitle);
                
                // In production, send to analytics service
                // trackProductView(productTitle);
                
                // Stop observing after first view
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    productCards.forEach(card => observer.observe(card));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Function to validate lynk.id links (optional)
function validateLynkIdLink(url) {
    // Check if URL contains lynk.id domain
    return url.includes('lynk.id');
}

// Function to format price (optional)
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

// Export functions for use in other scripts
window.ShopFunctions = {
    validateLynkIdLink: validateLynkIdLink,
    formatPrice: formatPrice
};

// Made with Bob
