// Main JavaScript functionality for ALiza Store

// Global variables
let products = [];
let cart = JSON.parse(localStorage.getItem('alizastore_cart')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadProducts();
    setupEventListeners();
    updateCartCount();
});

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('assets/data/products.json');
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback products if JSON fails to load
        products = getFallbackProducts();
    }
}

// Fallback products data
function getFallbackProducts() {
    return [
        {
            id: 1,
            name: "Classic Cotton T-Shirt",
            category: "clothing",
            price: 29.99,
            originalPrice: 39.99,
            image: "fas fa-tshirt",
            description: "Premium quality cotton t-shirt with comfortable fit",
            rating: 4.5,
            reviews: 124,
            colors: ["#000000", "#ffffff", "#6f42c1", "#dc3545"],
            sizes: ["XS", "S", "M", "L", "XL"],
            inStock: true,
            featured: true,
            sale: true
        },
        {
            id: 2,
            name: "Denim Jacket",
            category: "clothing",
            price: 89.99,
            image: "fas fa-user-tie",
            description: "Stylish denim jacket perfect for casual wear",
            rating: 4.3,
            reviews: 89,
            colors: ["#4169E1", "#000080"],
            sizes: ["S", "M", "L", "XL"],
            inStock: true,
            featured: true
        },
        {
            id: 3,
            name: "Designer Sunglasses",
            category: "accessories",
            price: 149.99,
            originalPrice: 199.99,
            image: "fas fa-glasses",
            description: "UV protection designer sunglasses with premium frames",
            rating: 4.7,
            reviews: 67,
            colors: ["#000000", "#8B4513"],
            inStock: true,
            featured: true,
            sale: true
        },
        {
            id: 4,
            name: "Running Shoes",
            category: "shoes",
            price: 129.99,
            image: "fas fa-shoe-prints",
            description: "Comfortable running shoes with advanced cushioning",
            rating: 4.4,
            reviews: 156,
            colors: ["#000000", "#ffffff", "#FF6347"],
            sizes: ["7", "8", "9", "10", "11", "12"],
            inStock: true,
            featured: true
        },
        {
            id: 5,
            name: "Leather Handbag",
            category: "bags",
            price: 199.99,
            originalPrice: 249.99,
            image: "fas fa-briefcase",
            description: "Genuine leather handbag with elegant design",
            rating: 4.8,
            reviews: 93,
            colors: ["#8B4513", "#000000", "#800080"],
            inStock: true,
            featured: true,
            sale: true
        },
        {
            id: 6,
            name: "Casual Sneakers",
            category: "shoes",
            price: 79.99,
            image: "fas fa-shoe-prints",
            description: "Comfortable casual sneakers for everyday wear",
            rating: 4.2,
            reviews: 78,
            colors: ["#ffffff", "#000000", "#808080"],
            sizes: ["7", "8", "9", "10", "11"],
            inStock: true
        },
        {
            id: 7,
            name: "Wool Scarf",
            category: "accessories",
            price: 39.99,
            image: "fas fa-hat-cowboy",
            description: "Warm wool scarf perfect for winter",
            rating: 4.1,
            reviews: 45,
            colors: ["#800080", "#008000", "#FF0000"],
            inStock: true
        },
        {
            id: 8,
            name: "Formal Dress Shirt",
            category: "clothing",
            price: 69.99,
            image: "fas fa-user-tie",
            description: "Professional dress shirt for formal occasions",
            rating: 4.6,
            reviews: 112,
            colors: ["#ffffff", "#87CEEB", "#FFB6C1"],
            sizes: ["S", "M", "L", "XL", "XXL"],
            inStock: true
        }
    ];
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('alizastore_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('alizastore_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit();
            }
        });
    }

    // Newsletter form
    const newsletterForm = document.querySelector('form');
    if (newsletterForm && newsletterForm.querySelector('input[type="email"]')) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

// Debounce function for search
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

// Handle search input
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    if (query.length > 2) {
        // Redirect to products page with search query
        if (window.location.pathname.includes('products.html')) {
            filterProductsBySearch(query);
        }
    }
}

// Handle search submit
function handleSearchSubmit() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

// Handle newsletter submission
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    if (email) {
        // Simulate newsletter subscription
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        event.target.reset();
    }
}

// Load featured products on homepage
async function loadFeaturedProducts() {
    await loadProducts();
    const featuredContainer = document.getElementById('featuredProducts');
    
    if (!featuredContainer) return;
    
    const featuredProducts = products.filter(product => product.featured).slice(0, 4);
    
    featuredContainer.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    return `
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card product-card h-100 shadow-sm">
                <div class="product-image">
                    <i class="${product.image}"></i>
                    ${product.sale || hasDiscount ? `<span class="badge bg-danger product-badge">${discountPercent}% OFF</span>` : ''}
                    <div class="product-actions">
                        <button class="btn btn-light btn-sm" onclick="toggleWishlist(${product.id})" title="Add to Wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="btn btn-light btn-sm" onclick="quickView(${product.id})" title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title mb-2">${product.name}</h6>
                    <div class="rating mb-2">
                        ${generateStarRating(product.rating)}
                        <small class="text-muted ms-1">(${product.reviews})</small>
                    </div>
                    <div class="price mb-3">
                        <span class="product-price">$${product.price}</span>
                        ${hasDiscount ? `<span class="product-price-original">$${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="mt-auto">
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="addToCart(${product.id})">
                                <i class="fas fa-shopping-cart me-1"></i>Add to Cart
                            </button>
                            <a href="product-detail.html?id=${product.id}" class="btn btn-outline-secondary">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Add product to cart
function addToCart(productId, quantity = 1, selectedSize = null, selectedColor = null) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => 
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            selectedSize: selectedSize,
            selectedColor: selectedColor
        });
    }
    
    localStorage.setItem('alizastore_cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!', 'success');
}

// Remove from cart
function removeFromCart(productId, selectedSize = null, selectedColor = null) {
    cart = cart.filter(item => 
        !(item.id === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor)
    );
    localStorage.setItem('alizastore_cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product removed from cart!', 'info');
}

// Update cart item quantity
function updateCartQuantity(productId, quantity, selectedSize = null, selectedColor = null) {
    const item = cart.find(item => 
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
    );
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId, selectedSize, selectedColor);
        } else {
            item.quantity = quantity;
            localStorage.setItem('alizastore_cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

// Calculate cart total
function calculateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;
    
    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping === 0 ? 'Free' : shipping.toFixed(2),
        total: total.toFixed(2)
    };
}

// Toggle wishlist
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('alizastore_wishlist')) || [];
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist!', 'info');
    } else {
        wishlist.push(productId);
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('alizastore_wishlist', JSON.stringify(wishlist));
}

// Make theme toggle globally accessible
window.toggleTheme = toggleTheme;

// Quick view product
function quickView(productId) {
    // Redirect to product detail page for now
    window.location.href = `product-detail.html?id=${productId}`;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Load product detail
async function loadProductDetail() {
    const productId = parseInt(getUrlParameter('id'));
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    await loadProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.location.href = 'products.html';
        return;
    }
    
    displayProductDetail(product);
    loadRelatedProducts(product.category, product.id);
}

// Display product detail
function displayProductDetail(product) {
    const container = document.getElementById('productDetail');
    const breadcrumb = document.getElementById('breadcrumb');
    
    // Update breadcrumb
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <li class="breadcrumb-item"><a href="index.html">Home</a></li>
            <li class="breadcrumb-item"><a href="products.html">Products</a></li>
            <li class="breadcrumb-item"><a href="products.html?category=${product.category}">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a></li>
            <li class="breadcrumb-item active">${product.name}</li>
        `;
    }
    
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    container.innerHTML = `
        <div class="col-lg-6">
            <div class="product-detail-image">
                <i class="${product.image}"></i>
            </div>
            <div class="product-thumbnails">
                <div class="product-thumbnail active">
                    <i class="${product.image}"></i>
                </div>
                <div class="product-thumbnail">
                    <i class="${product.image}"></i>
                </div>
                <div class="product-thumbnail">
                    <i class="${product.image}"></i>
                </div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="product-info">
                ${product.sale || hasDiscount ? `<span class="badge bg-danger mb-2">${discountPercent}% OFF</span>` : ''}
                <h1 class="mb-3">${product.name}</h1>
                <div class="rating mb-3">
                    ${generateStarRating(product.rating)}
                    <span class="ms-2 text-muted">(${product.reviews} reviews)</span>
                </div>
                <div class="price mb-4">
                    <span class="h3 text-primary">${formatCurrency(product.price)}</span>
                    ${hasDiscount ? `<span class="h5 text-muted text-decoration-line-through ms-2">${formatCurrency(product.originalPrice)}</span>` : ''}
                </div>
                <p class="mb-4">${product.description}</p>
                
                ${product.colors ? `
                <div class="mb-3">
                    <h6>Color:</h6>
                    <div class="color-selector">
                        ${product.colors.map(color => `
                            <div class="color-option" style="background-color: ${color}" onclick="selectColor('${color}')" data-color="${color}"></div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${product.sizes ? `
                <div class="mb-3">
                    <h6>Size:</h6>
                    <div class="size-selector">
                        ${product.sizes.map(size => `
                            <div class="size-option" onclick="selectSize('${size}')" data-size="${size}">${size}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="row mb-4">
                    <div class="col-md-4">
                        <label class="form-label">Quantity:</label>
                        <div class="quantity-controls">
                            <button type="button" onclick="changeQuantity(-1)">-</button>
                            <input type="number" id="quantity" value="1" min="1" max="10">
                            <button type="button" onclick="changeQuantity(1)">+</button>
                        </div>
                    </div>
                </div>
                
                <div class="d-grid gap-2 mb-4">
                    <button class="btn btn-primary btn-lg" onclick="addToCartFromDetail(${product.id})">
                        <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                    </button>
                    <button class="btn btn-outline-secondary" onclick="toggleWishlist(${product.id})">
                        <i class="far fa-heart me-2"></i>Add to Wishlist
                    </button>
                </div>
                
                <div class="product-features">
                    <ul class="list-unstyled">
                        <li class="mb-2"><i class="fas fa-truck text-primary me-2"></i>Free shipping on orders over $50</li>
                        <li class="mb-2"><i class="fas fa-undo text-primary me-2"></i>30-day return policy</li>
                        <li class="mb-2"><i class="fas fa-shield-alt text-primary me-2"></i>1-year warranty</li>
                        <li class="mb-2"><i class="fas fa-headset text-primary me-2"></i>24/7 customer support</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Product detail functions
let selectedColor = null;
let selectedSize = null;

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('active', option.dataset.color === color);
    });
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.toggle('active', option.dataset.size === size);
    });
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(1, Math.min(10, currentValue + change));
    quantityInput.value = newValue;
}

function addToCartFromDetail(productId) {
    const quantity = parseInt(document.getElementById('quantity').value);
    addToCart(productId, quantity, selectedSize, selectedColor);
}

// Load related products
async function loadRelatedProducts(category, currentProductId) {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer) return;
    
    const relatedProducts = products
        .filter(p => p.category === category && p.id !== currentProductId)
        .slice(0, 4);
    
    relatedContainer.innerHTML = relatedProducts.map(product => createProductCard(product)).join('');
}
