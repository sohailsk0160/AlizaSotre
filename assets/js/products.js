// Products page functionality

let currentPage = 1;
const productsPerPage = 9;
let filteredProducts = [];
let gridColumns = 3;

// Initialize products page
async function initializeProductsPage() {
    await loadProducts();
    applyUrlFilters();
    setupFilterListeners();
    displayProducts();
}

// Apply filters from URL parameters
function applyUrlFilters() {
    const category = getUrlParameter('category');
    const search = getUrlParameter('search');
    
    if (category && category !== 'all') {
        document.querySelector(`input[name="category"][value="${category}"]`).checked = true;
    }
    
    if (search) {
        document.getElementById('searchInput').value = search;
    }
    
    filterProducts();
}

// Setup filter event listeners
function setupFilterListeners() {
    // Category filters
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', filterProducts);
    });
    
    // Price filters
    document.querySelectorAll('input[name="price"]').forEach(radio => {
        radio.addEventListener('change', filterProducts);
    });
    
    // Sort dropdown
    document.getElementById('sortBy').addEventListener('change', sortProducts);
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(filterProducts, 300));
}

// Filter products based on selected criteria
function filterProducts() {
    const selectedCategory = document.querySelector('input[name="category"]:checked').value;
    const selectedPrice = document.querySelector('input[name="price"]:checked').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    filteredProducts = products.filter(product => {
        // Category filter
        const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
        
        // Price filter
        let priceMatch = true;
        if (selectedPrice !== 'all') {
            const [min, max] = selectedPrice.split('-').map(Number);
            priceMatch = product.price >= min && product.price <= max;
        }
        
        // Search filter
        const searchMatch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery);
        
        return categoryMatch && priceMatch && searchMatch;
    });
    
    currentPage = 1;
    sortProducts();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        default:
            // Default sorting (featured first, then by ID)
            filteredProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.id - b.id;
            });
    }
    
    displayProducts();
}

// Display products with pagination
function displayProducts() {
    const container = document.getElementById('productsGrid');
    const productCount = document.getElementById('productCount');
    
    if (!container) return;
    
    // Update product count
    if (productCount) {
        const start = (currentPage - 1) * productsPerPage + 1;
        const end = Math.min(currentPage * productsPerPage, filteredProducts.length);
        productCount.textContent = `Showing ${start}-${end} of ${filteredProducts.length} products`;
    }
    
    // Get products for current page
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Display products
    if (productsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search display-1 text-muted mb-3"></i>
                <h3>No products found</h3>
                <p class="text-muted">Try adjusting your filters or search terms</p>
                <button class="btn btn-primary" onclick="clearFilters()">Clear All Filters</button>
            </div>
        `;
    } else {
        const colClass = getGridColumnClass();
        container.innerHTML = productsToShow.map(product => {
            const cardHTML = createProductCard(product);
            return cardHTML.replace('col-lg-3 col-md-6', colClass);
        }).join('');
    }
    
    // Update pagination
    updatePagination();
}

// Get grid column class based on current view
function getGridColumnClass() {
    switch (gridColumns) {
        case 1:
            return 'col-12';
        case 2:
            return 'col-lg-6 col-md-6';
        case 3:
        default:
            return 'col-lg-4 col-md-6';
    }
}

// Set grid view
function setGridView(columns) {
    gridColumns = columns;
    
    // Update active button
    document.querySelectorAll('.btn-group button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayProducts();
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }
    
    currentPage = page;
    displayProducts();
    
    // Scroll to top of products
    document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth' });
}

// Clear all filters
function clearFilters() {
    // Reset category filter
    document.querySelector('input[name="category"][value="all"]').checked = true;
    
    // Reset price filter
    document.querySelector('input[name="price"][value="all"]').checked = true;
    
    // Reset sort
    document.getElementById('sortBy').value = 'default';
    
    // Clear search
    document.getElementById('searchInput').value = '';
    
    // Apply filters
    filterProducts();
}

// Filter products by search (called from main.js)
function filterProductsBySearch(query) {
    document.getElementById('searchInput').value = query;
    filterProducts();
}

// Export functions for use in HTML onclick handlers
window.setGridView = setGridView;
window.changePage = changePage;
window.clearFilters = clearFilters;
