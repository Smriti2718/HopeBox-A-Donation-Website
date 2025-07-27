document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap Modals
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    const wishlistModal = new bootstrap.Modal(document.getElementById('wishlistModal'));

    // Cart functionality
    let cart = [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartCount = document.querySelector('.cart-count');

    // Wishlist functionality
    let wishlist = [];
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    const wishlistCount = document.querySelector('.wishlist-count');

    // Search and product elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const productsGrid = document.getElementById('products-grid');
    const productCards = document.querySelectorAll('.product-card');

    // Add styles for all functionality
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }

        .notification.success {
            background-color: #28a745;
        }

        .notification.error {
            background-color: #dc3545;
        }

        .cart-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }

        .cart-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
        }

        .cart-item-info {
            flex: 1;
            padding: 0 15px;
        }

        .cart-item-info h6 {
            margin-bottom: 5px;
            font-size: 0.9rem;
        }

        .cart-item-remove {
            background: none;
            border: none;
            color: #dc3545;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 5px;
        }

        .quantity-controls {
            display: flex;
            align-items: center;
        }

        .quantity-controls button {
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .empty-cart-message {
            color: #6c757d;
        }

        .product-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--primary-color);
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.7rem;
            font-weight: bold;
        }

        .wishlist-btn .fas {
            color: #dc3545;
        }

        .original-price {
            text-decoration: line-through;
            color: #6c757d;
            font-size: 0.8rem;
            margin-left: 5px;
        }

        .rating {
            color: #ffc107;
            margin-bottom: 8px;
        }

        .rating-count {
            color: #6c757d;
            font-size: 0.8rem;
            margin-left: 5px;
        }

        .search-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            max-width: 600px;
            margin: 0 auto;
        }

        .clear-search-btn {
            position: absolute;
            right: 120px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transition: opacity 0.3s;
        }

        .clear-search-btn:hover {
            opacity: 1;
        }

        .alert {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }

        .alert .btn-link {
            text-decoration: none;
            color: var(--primary-color);
            font-weight: 600;
        }

        .alert .btn-link:hover {
            text-decoration: underline;
        }

        .checkout-items {
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 1rem;
        }
        
        .checkout-item {
            display: flex;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .checkout-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 1rem;
        }
        
        .checkout-item-info {
            flex: 1;
        }
        
        .checkout-item-info h6 {
            margin-bottom: 0.25rem;
        }
        
        .checkout-total {
            padding-top: 1rem;
            border-top: 2px solid #eee;
        }
        
        .checkout-total > div {
            margin-bottom: 0.5rem;
        }
        
        #paymentForm .form-control {
            border-radius: 4px;
            padding: 0.75rem;
        }
        
        #paymentForm .form-control:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
        }
    `;
    document.head.appendChild(style);

    // Update cart count
    function updateCartCount() {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Update wishlist count
    function updateWishlistCount() {
        wishlistCount.textContent = wishlist.length;
    }

    // Update wishlist display
    function updateWishlistDisplay() {
        wishlistItemsContainer.innerHTML = '';

        if (wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = `
                <div class="empty-wishlist-message">
                    <i class="far fa-heart fa-3x mb-3" style="color: #ddd;"></i>
                    <p>Your wishlist is empty</p>
                    <a href="ngo-bazaar.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        wishlist.forEach((item, index) => {
            const wishlistItem = document.createElement('div');
            wishlistItem.className = 'wishlist-item';
            wishlistItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="wishlist-item-info">
                    <h6>${item.name}</h6>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="wishlist-item-price">₹${item.price}</span>
                        <div class="wishlist-item-actions">
                            <button class="move-to-cart-btn" data-index="${index}">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="remove-from-wishlist-btn" data-index="${index}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
            wishlistItemsContainer.appendChild(wishlistItem);
        });
    }

    // Toggle wishlist item
    function toggleWishlist(product, button) {
        const existingIndex = wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
            wishlist.splice(existingIndex, 1);
            button.classList.remove('active');
            showNotification('Removed from wishlist!');
        } else {
            wishlist.push(product);
            button.classList.add('active');
            showNotification('Added to wishlist!');
        }
        
        updateWishlistCount();
        updateWishlistDisplay();
    }

    // Event listeners for wishlist actions
    wishlistItemsContainer.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const index = parseInt(button.getAttribute('data-index'));

        if (button.classList.contains('move-to-cart-btn')) {
            // Add to cart
            const item = wishlist[index];
            // Ensure price is a number before adding to cart
            item.price = parseFloat(item.price) || 0;
            addToCart(item);
            // Remove from wishlist
            wishlist.splice(index, 1);
            updateWishlistCount();
            updateWishlistDisplay();
            showNotification('Item moved to cart!');
        } else if (button.classList.contains('remove-from-wishlist-btn')) {
            wishlist.splice(index, 1);
            updateWishlistCount();
            updateWishlistDisplay();
            showNotification('Item removed from wishlist!');

            // Update the heart icon on the product card if it exists
            const productCard = document.querySelector(`[data-id="${wishlist[index].id}"]`);
            if (productCard) {
                const wishlistBtn = productCard.querySelector('.wishlist-btn');
                wishlistBtn.classList.remove('active');
            }
        }
    });

    // Initialize wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            const product = {
                id: card.getAttribute('data-id') || Date.now().toString(),
                name: card.querySelector('h3').textContent,
                price: parseInt(card.querySelector('.price').textContent.replace('₹', '').replace(',', '')),
                image: card.querySelector('.product-image img').src
            };

            toggleWishlist(product, this);
        });
    });

    // Initialize wishlist count and display
    updateWishlistCount();
    updateWishlistDisplay();

    // Category filter functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    const activeFiltersList = document.querySelector('.active-filters-list');
    let activeFilters = new Set();

    function updateActiveFiltersDisplay() {
        activeFiltersList.innerHTML = '';
        
        if (activeFilters.size > 0) {
            activeFilters.forEach(category => {
                const filterTag = document.createElement('div');
                filterTag.className = 'active-filter-tag';
                filterTag.innerHTML = `
                    ${category.charAt(0).toUpperCase() + category.slice(1)}
                    <button class="remove-filter" data-category="${category}">×</button>
                `;
                activeFiltersList.appendChild(filterTag);
            });

            // Add clear all button
            const clearButton = document.createElement('button');
            clearButton.className = 'clear-filters';
            clearButton.textContent = 'Clear All';
            clearButton.addEventListener('click', clearAllFilters);
            activeFiltersList.appendChild(clearButton);
        }
    }

    function clearAllFilters() {
        activeFilters.clear();
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        updateActiveFiltersDisplay();
        filterProducts();
    }

    function filterProducts() {
        const productCards = document.querySelectorAll('.product-card');
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        productCards.forEach(card => {
            const category = card.closest('[data-category]').getAttribute('data-category');
            const productName = card.querySelector('h3').textContent.toLowerCase();
            const productDesc = card.querySelector('.description').textContent.toLowerCase();
            
            // Check both search term and category filters
            const matchesSearch = !searchTerm || 
                productName.includes(searchTerm) || 
                productDesc.includes(searchTerm);
            
            const matchesCategory = activeFilters.size === 0 || activeFilters.has(category);
            
            if (matchesSearch && matchesCategory) {
                card.closest('.col-md-4').style.display = 'block';
            } else {
                card.closest('.col-md-4').style.display = 'none';
            }
        });

        // Scroll to products section smoothly
        const productsSection = document.querySelector('#products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');

            // Toggle the clicked category
            if (activeFilters.has(category)) {
                activeFilters.delete(category);
                button.classList.remove('active');
                } else {
                activeFilters.add(category);
                button.classList.add('active');
                }
            
            updateActiveFiltersDisplay();
            filterProducts();
        });
    });

    // Handle removing individual filters
    activeFiltersList.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-filter')) {
            const category = e.target.getAttribute('data-category');
            activeFilters.delete(category);
            
            // Update the corresponding button state
            document.querySelector(`.category-btn[data-category="${category}"]`).classList.remove('active');
            
            updateActiveFiltersDisplay();
            filterProducts();
        }
    });

    // Initialize with no filters selected (showing all products)
    updateActiveFiltersDisplay();

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // If search is empty, just apply filters
        if (!searchTerm) {
            filterProducts();
            return;
        }

        // Hide all products first
        productCards.forEach(card => {
            card.closest('.col-md-4').style.display = 'none';
        });

        let hasResults = false;

        // Show products that match the search term
        productCards.forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            const productDesc = card.querySelector('.description').textContent.toLowerCase();
            
            if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
                card.closest('.col-md-4').style.display = 'block';
                hasResults = true;
            }
        });

        // Show no results message if no products match the search
        const searchContainer = document.querySelector('.search-container');
        let noResultsMessage = document.querySelector('.no-results-message');
        
        if (!hasResults) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.className = 'no-results-message alert alert-warning mt-3';
                noResultsMessage.innerHTML = `
                    <i class="fas fa-exclamation-circle me-2"></i>
                    No products found matching "${searchTerm}"
                `;
                searchContainer.parentNode.insertBefore(noResultsMessage, searchContainer.nextSibling);
            }
            return; // Don't scroll if no results found
        } else {
            // Remove no results message if it exists
            if (noResultsMessage) {
                noResultsMessage.remove();
            }
        }

        // Only scroll to products section if we have results
        const productsSection = document.querySelector('#products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function clearSearch() {
        searchInput.value = '';
        const noResultsMessage = document.querySelector('.no-results-message');
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
        filterProducts();
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Add clear search button to search input
    const searchContainer = document.querySelector('.search-container');
    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.className = 'clear-search-btn';
    clearSearchBtn.innerHTML = '<i class="fas fa-times"></i>';
    searchContainer.appendChild(clearSearchBtn);

    clearSearchBtn.addEventListener('click', clearSearch);

    // Add to cart functionality
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const product = {
                id: card.getAttribute('data-id') || Date.now().toString(),
                name: card.querySelector('h3').textContent,
                price: parseInt(card.querySelector('.price').textContent.replace('₹', '').replace(',', '')),
                image: card.querySelector('.product-image img').src,
                quantity: 1
            };

            addToCart(product);
        });
    });

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Ensure product has all required properties
            const newItem = {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price) || 0, // Convert to number and handle undefined
                image: product.image,
                quantity: 1 // Initialize quantity
            };
            cart.push(newItem);
        }
        
        updateCartDisplay();
        updateCartCount();
        showNotification('Item added to cart!');
    }

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message text-center py-4">
                    <i class="fas fa-shopping-cart fa-3x mb-3" style="color: #ddd;"></i>
                    <p>Your cart is empty</p>
                    <a href="ngo-bazaar.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            cartTotalAmount.textContent = '₹0';
            return;
        }
        
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h6>${item.name}</h6>
                    <div class="d-flex justify-content-between">
                        <span class="cart-item-price">₹${item.price * item.quantity}</span>
                        <div class="quantity-controls">
                            <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-index="${index}">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary increase-quantity" data-index="${index}">+</button>
                    </div>
                </div>
            </div>
                <button class="cart-item-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });

        cartTotalAmount.textContent = `₹${total}`;
    }

    // Cart item manipulation
    cartItemsContainer.addEventListener('click', function(e) {
        // Remove item
        if (e.target.closest('.cart-item-remove')) {
            const index = parseInt(e.target.closest('.cart-item-remove').getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartDisplay();
            updateCartCount();
            showNotification('Item removed from cart!');
        }
        
        // Decrease quantity
        if (e.target.classList.contains('decrease-quantity')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
                showNotification('Item removed from cart!');
            }
            updateCartDisplay();
            updateCartCount();
        }
        
        // Increase quantity
        if (e.target.classList.contains('increase-quantity')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart[index].quantity += 1;
            updateCartDisplay();
            updateCartCount();
        }
    });

    // Checkout functionality
    document.querySelector('.checkout-btn').addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Create checkout modal content
        const checkoutModal = document.createElement('div');
        checkoutModal.className = 'modal fade';
        checkoutModal.id = 'checkoutModal';
        checkoutModal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Checkout</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Order Summary</h6>
                                <div class="checkout-items">
                                    ${cart.map(item => `
                                        <div class="checkout-item">
                                            <img src="${item.image}" alt="${item.name}">
                                            <div class="checkout-item-info">
                                                <h6>${item.name}</h6>
                                                <div class="d-flex justify-content-between">
                                                    <span>Quantity: ${item.quantity}</span>
                                                    <span>₹${item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="checkout-total mt-3">
                                    <div class="d-flex justify-content-between">
                                        <span>Subtotal:</span>
                                        <span>₹${cart.reduce((total, item) => total + (item.price * item.quantity), 0)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Shipping:</span>
                                        <span>₹50</span>
                                    </div>
                                    <div class="d-flex justify-content-between fw-bold">
                                        <span>Total:</span>
                                        <span>₹${cart.reduce((total, item) => total + (item.price * item.quantity), 0) + 50}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6>Payment Details</h6>
                                <form id="paymentForm" class="mt-3">
                                    <div class="mb-3">
                                        <label class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="customerName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="customerEmail" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Phone</label>
                                        <input type="tel" class="form-control" id="customerPhone" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Shipping Address</label>
                                        <textarea class="form-control" id="shippingAddress" rows="3" required></textarea>
                                    </div>
                                    <div class="mb-4">
                                        <label class="form-label">Payment Method</label>
                                        <div class="payment-methods">
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="cardPayment" value="card" checked>
                                                <label class="form-check-label" for="cardPayment">
                                                    <i class="fas fa-credit-card me-2"></i>Credit/Debit Card
                                                </label>
                                            </div>
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="upiPayment" value="upi">
                                                <label class="form-check-label" for="upiPayment">
                                                    <i class="fas fa-mobile-alt me-2"></i>UPI
                                                </label>
                                            </div>
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="netbankingPayment" value="netbanking">
                                                <label class="form-check-label" for="netbankingPayment">
                                                    <i class="fas fa-university me-2"></i>Net Banking
                                                </label>
                                            </div>
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="cashPayment" value="cash">
                                                <label class="form-check-label" for="cashPayment">
                                                    <i class="fas fa-money-bill-wave me-2"></i>Cash on Delivery
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Card Payment Details -->
                                    <div id="cardDetails" class="payment-method-details">
                                        <div class="mb-3">
                                            <label class="form-label">Card Number</label>
                                            <input type="text" class="form-control" placeholder="1234 5678 9012 3456" required>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-6">
                                                <label class="form-label">Expiry Date</label>
                                                <input type="text" class="form-control" placeholder="MM/YY" required>
                                            </div>
                                            <div class="col-6">
                                                <label class="form-label">CVV</label>
                                                <input type="text" class="form-control" placeholder="123" required>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Name on Card</label>
                                            <input type="text" class="form-control" required>
                                        </div>
                                    </div>

                                    <!-- UPI Payment Details -->
                                    <div id="upiDetails" class="payment-method-details" style="display: none;">
                                        <div class="text-center mb-3">
                                            <div id="upiQRCode" class="mb-3"></div>
                                            <p class="mb-2">Scan QR code with any UPI app</p>
                                            <p class="upi-id mb-3">UPI ID: hopebox@upi</p>
                                            <div class="mb-3">
                                                <label class="form-label">Enter UPI ID</label>
                                                <input type="text" class="form-control" placeholder="yourname@upi" required>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">UPI App</label>
                                                <select class="form-select" required>
                                                    <option value="">Select UPI App</option>
                                                    <option value="gpay">Google Pay</option>
                                                    <option value="phonepe">PhonePe</option>
                                                    <option value="paytm">Paytm</option>
                                                    <option value="bhim">BHIM</option>
                                                    <option value="other">Other UPI Apps</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Net Banking Details -->
                                    <div id="netbankingDetails" class="payment-method-details" style="display: none;">
                                        <div class="mb-3">
                                            <label class="form-label">Select Bank</label>
                                            <select class="form-select" required>
                                                <option value="">Choose your bank</option>
                                                <option value="sbi">State Bank of India</option>
                                                <option value="hdfc">HDFC Bank</option>
                                                <option value="icici">ICICI Bank</option>
                                                <option value="axis">Axis Bank</option>
                                                <option value="kotak">Kotak Mahindra Bank</option>
                                                <option value="indian">Indian Bank</option>
                                                <option value="other">Other Banks</option>
                                            </select>
                                        </div>
                                        <div class="alert alert-info">
                                            <i class="fas fa-info-circle me-2"></i>
                                            You will be redirected to your bank's secure payment page.
                                        </div>
                                    </div>

                                    <!-- Cash on Delivery Details -->
                                    <div id="cashDetails" class="payment-method-details" style="display: none;">
                                        <div class="alert alert-info">
                                            <i class="fas fa-info-circle me-2"></i>
                                            Pay in cash when your order is delivered.
                                        </div>
                                    </div>

                                    <button type="submit" class="btn btn-primary w-100">Place Order</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body and show it
        document.body.appendChild(checkoutModal);
        const modal = new bootstrap.Modal(checkoutModal);
        modal.show();

        // Handle payment method selection
        const paymentMethodInputs = checkoutModal.querySelectorAll('input[name="paymentMethod"]');
        paymentMethodInputs.forEach(radio => {
            radio.addEventListener('change', function() {
                // Hide all payment details first
                checkoutModal.querySelectorAll('.payment-method-details').forEach(detail => {
                    detail.style.display = 'none';
                });
                
                // Show selected payment method details
                const selectedMethod = this.value;
                const selectedDetails = checkoutModal.querySelector(`#${selectedMethod}Details`);
                selectedDetails.style.display = 'block';

                // Generate UPI QR code if UPI is selected
                if (selectedMethod === 'upi') {
                    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=hopebox@upi&pn=HopeBox&am=${total}&cu=INR`;
                    const qrCodeContainer = checkoutModal.querySelector('#upiQRCode');
                    qrCodeContainer.innerHTML = `<img src="${qrCodeUrl}" class="img-fluid" style="max-width: 200px;">`;
                }
            });
        });
        
        // Handle form submission
        const paymentForm = checkoutModal.querySelector('#paymentForm');
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get selected payment method
            const paymentMethod = checkoutModal.querySelector('input[name="paymentMethod"]:checked').value;
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            
            // Simulate payment processing
            setTimeout(() => {
                // Gather order details
                const orderDetails = {
                    customerName: checkoutModal.querySelector('#customerName').value,
                    customerEmail: checkoutModal.querySelector('#customerEmail').value,
                    customerPhone: checkoutModal.querySelector('#customerPhone').value,
                    shippingAddress: checkoutModal.querySelector('#shippingAddress').value,
                    paymentMethod: paymentMethod,
                    items: cart,
                    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                };

                // Clear cart
                cart = [];
                updateCartDisplay();
                updateCartCount();
                
                // Close checkout modal
                modal.hide();
                
                // Show success message based on payment method
                if (paymentMethod === 'cash') {
                    showNotification('Order placed successfully! You will pay ₹' + orderDetails.total + ' at delivery.');
                } else if (paymentMethod === 'netbanking') {
                    showNotification('Order placed successfully! You will be redirected to your bank\'s payment page.');
                } else if (paymentMethod === 'upi') {
                    showNotification('Order placed successfully! Please complete the payment using your UPI app.');
                } else {
                    showNotification('Order placed successfully! Thank you for your purchase.');
                }
                
                // Remove checkout modal from DOM
                checkoutModal.remove();
            }, 2000);
        });
        
        // Clean up modal when closed
        checkoutModal.addEventListener('hidden.bs.modal', function() {
            checkoutModal.remove();
        });
    });

    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            showNotification('Thank you for subscribing!');
            this.reset();
        });
    }

    // Login/Register form handling
    document.querySelectorAll('.auth-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const modalId = this.closest('.modal').id;
            
            // In a real implementation, you would validate and send to server
            showNotification('Form submitted successfully!');
            
            // Close the current modal
            bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
        });
    });

    // Modal links (like "Forgot password" and "Register")
    document.querySelectorAll('[data-bs-toggle="modal"][data-bs-target]').forEach(link => {
        link.addEventListener('click', function() {
            const targetModal = this.getAttribute('data-bs-target');
            const currentModal = this.closest('.modal');
            
            if (currentModal) {
                bootstrap.Modal.getInstance(currentModal).hide();
            }
            
            // Show the target modal after a small delay
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.querySelector(targetModal)).show();
            }, 300);
        });
    });

    // Initialize cart count and display
    updateCartCount();
    updateCartDisplay();

    // Notification system
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Remove any existing notifications first
        document.querySelectorAll('.notification').forEach(el => el.remove());
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Sample product data (in a real app, this would come from a server)
    const sampleProducts = [
        {
            id: '1',
            name: 'Handmade Wooden Toy',
            price: 299,
            originalPrice: 399,
            category: 'handmade',
            image: 'https://res.cloudinary.com/dftao6jzx/image/upload/v1737281785/Toys_m2kzyi.jpg',
            description: 'Beautifully crafted wooden toy made by local artisans',
            rating: 4.5,
            reviews: 42,
            badge: 'Best Seller'
        },
        // Add more sample products as needed
    ];

    // In a real implementation, you would fetch products from an API
    // and dynamically generate the product cards
});