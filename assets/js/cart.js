// Shopping cart functionality

// Load and display cart
function loadCart() {
    const cartContainer = document.getElementById('cartItems');
    const emptyCartTemplate = document.getElementById('emptyCartTemplate');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = emptyCartTemplate.innerHTML;
        updateCartSummary();
        return;
    }
    
    cartContainer.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
    updateCartSummary();
}

// Create cart item HTML
function createCartItemHTML(item) {
    return `
        <div class="cart-item" data-id="${item.id}" data-size="${item.selectedSize || ''}" data-color="${item.selectedColor || ''}">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <div class="cart-item-image">
                        <i class="${item.image}"></i>
                    </div>
                </div>
                <div class="col-md-4">
                    <h6 class="mb-1">${item.name}</h6>
                    ${item.selectedSize ? `<small class="text-muted">Size: ${item.selectedSize}</small><br>` : ''}
                    ${item.selectedColor ? `<small class="text-muted">Color: <span class="d-inline-block rounded-circle" style="width: 12px; height: 12px; background-color: ${item.selectedColor}; border: 1px solid #ddd;"></span></small>` : ''}
                </div>
                <div class="col-md-2">
                    <span class="fw-bold">${formatCurrency(item.price)}</span>
                </div>
                <div class="col-md-2">
                    <div class="quantity-controls">
                        <button type="button" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1}, '${item.selectedSize || ''}', '${item.selectedColor || ''}')">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="10" onchange="updateCartItemQuantity(${item.id}, this.value, '${item.selectedSize || ''}', '${item.selectedColor || ''}')">
                        <button type="button" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1}, '${item.selectedSize || ''}', '${item.selectedColor || ''}')">+</button>
                    </div>
                </div>
                <div class="col-md-1">
                    <span class="fw-bold">${formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-outline-danger btn-sm" onclick="removeCartItem(${item.id}, '${item.selectedSize || ''}', '${item.selectedColor || ''}')" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update cart item quantity
function updateCartItemQuantity(productId, quantity, selectedSize = '', selectedColor = '') {
    const newQuantity = parseInt(quantity);
    
    if (newQuantity <= 0) {
        removeCartItem(productId, selectedSize, selectedColor);
        return;
    }
    
    if (newQuantity > 10) {
        showNotification('Maximum quantity is 10 per item', 'warning');
        return;
    }
    
    updateCartQuantity(productId, newQuantity, selectedSize || null, selectedColor || null);
    loadCart();
}

// Remove cart item
function removeCartItem(productId, selectedSize = '', selectedColor = '') {
    removeFromCart(productId, selectedSize || null, selectedColor || null);
    loadCart();
}

// Update cart summary
function updateCartSummary() {
    const totals = calculateCartTotal();
    
    // Update summary elements
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (subtotalElement) subtotalElement.textContent = `$${totals.subtotal}`;
    if (shippingElement) shippingElement.textContent = totals.shipping === 'Free' ? 'Free' : `$${totals.shipping}`;
    if (taxElement) taxElement.textContent = `$${totals.tax}`;
    if (totalElement) totalElement.textContent = `$${totals.total}`;
    
    // Disable checkout if cart is empty
    if (checkoutBtn) {
        if (cart.length === 0) {
            checkoutBtn.classList.add('disabled');
            checkoutBtn.href = '#';
        } else {
            checkoutBtn.classList.remove('disabled');
            checkoutBtn.href = 'checkout.html';
        }
    }
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    // Define valid promo codes
    const promoCodes = {
        'SAVE10': { discount: 0.10, type: 'percentage', description: '10% off' },
        'WELCOME': { discount: 15, type: 'fixed', description: '$15 off' },
        'FREESHIP': { discount: 0, type: 'shipping', description: 'Free shipping' }
    };
    
    if (promoCodes[promoCode]) {
        const promo = promoCodes[promoCode];
        
        // Store applied promo code
        localStorage.setItem('stylehaven_promo', JSON.stringify(promo));
        
        showNotification(`Promo code applied: ${promo.description}`, 'success');
        promoInput.value = '';
        
        // Recalculate totals with promo code
        updateCartSummary();
    } else {
        showNotification('Invalid promo code', 'error');
    }
}

// Calculate cart total with promo code
function calculateCartTotalWithPromo() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let shipping = subtotal > 50 ? 0 : 9.99;
    
    // Apply promo code if exists
    const storedPromo = localStorage.getItem('stylehaven_promo');
    if (storedPromo) {
        const promo = JSON.parse(storedPromo);
        
        if (promo.type === 'percentage') {
            discount = subtotal * promo.discount;
        } else if (promo.type === 'fixed') {
            discount = promo.discount;
        } else if (promo.type === 'shipping') {
            shipping = 0;
        }
    }
    
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = discountedSubtotal * 0.08; // 8% tax
    const total = discountedSubtotal + tax + shipping;
    
    return {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping === 0 ? 'Free' : shipping.toFixed(2),
        total: total.toFixed(2)
    };
}

// Load checkout items
function loadCheckoutItems() {
    const orderItemsContainer = document.getElementById('orderItems');
    if (!orderItemsContainer) return;
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">Qty: ${item.quantity}</small>
                ${item.selectedSize ? `<small class="text-muted d-block">Size: ${item.selectedSize}</small>` : ''}
            </div>
            <span class="fw-bold">${formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    updateCheckoutSummary();
}

// Update checkout summary
function updateCheckoutSummary() {
    const totals = calculateCartTotal();
    
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `$${totals.subtotal}`;
    if (shippingElement) shippingElement.textContent = totals.shipping === 'Free' ? 'Free' : `$${totals.shipping}`;
    if (taxElement) taxElement.textContent = `$${totals.tax}`;
    if (totalElement) totalElement.textContent = `$${totals.total}`;
}

// Initialize checkout
function initializeCheckout() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;
    
    // Setup form validation
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    
    // Setup payment method change
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentDetails);
    });
    
    // Setup same as billing checkbox
    const sameAsBilling = document.getElementById('sameAsBilling');
    if (sameAsBilling) {
        sameAsBilling.addEventListener('change', toggleShippingAddress);
    }
    
    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Format expiry date input
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
}

// Handle checkout form submission
function handleCheckoutSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateCheckoutForm()) {
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner me-2"></span>Processing...';
    submitBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        // Generate order ID
        const orderId = `SH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        document.getElementById('orderId').textContent = `#${orderId}`;
        
        // Clear cart
        cart = [];
        localStorage.removeItem('stylehaven_cart');
        localStorage.removeItem('stylehaven_promo');
        updateCartCount();
        
        // Show success modal
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Validate checkout form
function validateCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validate email
    const email = document.getElementById('email');
    if (email.value && !isValidEmail(email.value)) {
        email.classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate card number if credit card is selected
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (paymentMethod === 'credit') {
        const cardNumber = document.getElementById('cardNumber');
        if (!isValidCardNumber(cardNumber.value)) {
            cardNumber.classList.add('is-invalid');
            isValid = false;
        }
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

// Toggle payment details based on selected method
function togglePaymentDetails() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const creditCardDetails = document.getElementById('creditCardDetails');
    
    if (paymentMethod === 'credit') {
        creditCardDetails.style.display = 'block';
    } else {
        creditCardDetails.style.display = 'none';
    }
}

// Toggle shipping address
function toggleShippingAddress() {
    const sameAsBilling = document.getElementById('sameAsBilling');
    const shippingAddress = document.getElementById('shippingAddress');
    
    if (sameAsBilling.checked) {
        shippingAddress.classList.add('d-none');
    } else {
        shippingAddress.classList.remove('d-none');
    }
}

// Format card number
function formatCardNumber(event) {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        event.target.value = parts.join(' ');
    } else {
        event.target.value = value;
    }
}

// Format expiry date
function formatExpiryDate(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
}

// Validation helpers
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
}

// Export functions for global use
window.applyPromoCode = applyPromoCode;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.loadCheckoutItems = loadCheckoutItems;
window.initializeCheckout = initializeCheckout;
