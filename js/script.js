// Cart functions (existing - enhanced)
let cart = JSON.parse(localStorage.getItem('gymbroCart')) || [];

// ===== PRODUCTS: fetch from backend + render cards =====
// IMPORTANT: set this to the same base URL that makes checkout() work.
const API_BASE = 'https://gymbro-website-production.up.railway.app';
const PRODUCTS_ENDPOINT = `${API_BASE}/api/products`;

function formatINR(productPrice) {
    const inr = Number(productPrice);
    if (Number.isNaN(inr)) return '₹0 INR';
    return `₹${Math.round(inr)} INR`;
}


function productCardHTML(p, index = 0) {
    const name = p?.name ?? 'Unnamed';
    const category = p?.category ?? 'uncategorized';
    const description = p?.description ?? '';
    const image = p?.image ?? '';
    const stock = typeof p?.stock === 'number' ? p.stock : 0;

    const priceINR = formatINR(p?.price);

    const badgeHTML = stock <= 0 ? `<span class="sale-badge" style="background:#333;">OUT OF STOCK</span>` : '';

    const safeIndex = Number(index) || 0;

    return `
        <div class="product-card" data-category="${String(category)}" style="cursor: default;">
            ${badgeHTML}
            <div class="product-image" style="background-image:url('${String(image)}');">
            </div>
            <div class="product-info">
                <span class="category-label">${String(category).toUpperCase()}</span>
                <h3 class="product-name">${String(name)}</h3>
                <div class="price">${priceINR}</div>
                <p style="color:#ccc; font-size:13px; line-height:1.6; margin-bottom:14px; min-height:42px;">
                    ${String(description).slice(0, 90)}
                </p>
                <button
                    class="btn-cart"
                    data-price="${String(p?.price ?? 0)}"
                    data-name="${String(name)}"
                    ${stock <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
                >${stock <= 0 ? 'NOT AVAILABLE' : 'ADD TO CART'}</button>
            </div>
        </div>
    `;
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="product-card" style="cursor: default;">
            <div class="product-image" style="height: 280px; display:flex; align-items:center; justify-content:center;">
                <span style="color:#ccc; font-weight:600;">Loading products...</span>
            </div>
            <div class="product-info">
                <span class="category-label" style="opacity:0;">LOADING</span>
                <h3 class="product-name" style="opacity:0;">&nbsp;</h3>
                <div class="price" style="opacity:0;">&nbsp;</div>
                <button class="btn-cart" style="opacity:0; pointer-events:none;">ADD TO CART</button>
            </div>
        </div>
    `;

    try {
        const res = await fetch(PRODUCTS_ENDPOINT, { method: 'GET' });
        const data = await res.json();

        if (!res.ok || !data?.ok) {
            throw new Error(data?.error || 'Failed to load products');
        }

        const products = Array.isArray(data.products) ? data.products : [];
        renderProducts(products);
    } catch (err) {
        console.error('loadProducts error:', err);

        grid.innerHTML = `
            <div class="product-card" style="cursor: default;">
                <div class="product-image" style="height: 280px; display:flex; align-items:center; justify-content:center;">
                    <span style="color:#ff4757; font-weight:700;">Could not load products</span>
                </div>
                <div class="product-info">
                    <span class="category-label">ERROR</span>
                    <h3 class="product-name">Please refresh</h3>
                    <div class="price">—</div>
                    <button class="btn-cart" style="opacity:0.5; pointer-events:none;">ADD TO CART</button>
                </div>
            </div>
        `;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!products.length) {
        grid.innerHTML = `
            <div class="product-card" style="cursor: default;">
                <div class="product-image" style="height: 280px; display:flex; align-items:center; justify-content:center;">
                    <span style="color:#ccc; font-weight:600;">No products found</span>
                </div>
                <div class="product-info">
                    <span class="category-label">EMPTY</span>
                    <h3 class="product-name">&nbsp;</h3>
                    <div class="price">&nbsp;</div>
                    <button class="btn-cart" style="opacity:0.5; pointer-events:none;">ADD TO CART</button>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map((p, idx) => productCardHTML(p, idx)).join('');

    // Ensure filters apply to freshly rendered cards
    const activeBtn = document.querySelector('.filter-btn.active')
        || document.querySelector('.filter-btn[data-filter="all"].active')
        || document.querySelector('.filter-btn[data-category="all"].active');

    const activeCategory = activeBtn?.dataset?.filter || activeBtn?.dataset?.category || 'all';
    filterProducts(activeCategory);

    // Re-bind add-to-cart click handler for newly injected buttons.
    // Note: keep existing cart functionality. This section prevents multiple bindings.
    // NOTE: click handler for .btn-cart is already attached at the bottom of this file.
    // Keeping only one binding avoids duplicate cart entries.
}




function addToCart(name, price, event) {
    // Debug: verify parsed product price before storing
    console.log('addToCart product:', { name, price });

    // Debug: ensure we're storing the exact numeric price passed in
    console.log('addToCart storing cart item price:', price);

    // Store the exact price value we receive
    cart.push({ name, price: price, quantity: 1 });


    updateCart();
    if (event) {
        event.target.style.transform = 'scale(0.95)';
        setTimeout(() => event.target.style.transform = '', 150);
    }
}


function updateCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
    renderCart();
    localStorage.setItem('gymbroCart', JSON.stringify(cart));
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #ccc; margin: 40px 0;">Your cart is empty</p>';
        cartTotal.textContent = '₹0 INR';
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
        <div style="display: flex; gap: 15px; padding: 20px 0; border-bottom: 1px solid #333;">
            <div style="flex: 1;">
                <h4 style="margin-bottom: 5px;">${item.name}</h4>
                <div style="font-size: 14px; color: #ccc; margin-bottom: 8px;">${item.quantity} × ₹${Math.round(item.price)}</div>
                <p style="color: #ff4757; font-weight: 700; font-size: 18px;">₹${Math.round(item.price * item.quantity)} INR</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="changeQuantity(${index}, -1)" style="background: none; border: none; color: #ccc; font-size: 20px; cursor: pointer;">−</button>
                <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)" style="background: none; border: none; color: #ccc; font-size: 20px; cursor: pointer;">+</button>
                <button onclick="removeItem(${index})" style="background: none; border: none; color: #ff4757; font-size: 20px; cursor: pointer;">×</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `₹${Math.round(total)} INR`;
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
}

function toggleGymbroMenu() {
    const menu = document.getElementById('gymbroNavMenu');
    const toggle = document.getElementById('gymbroNavToggle');
    if (!menu || !toggle) return;

    const isOpen = menu.classList.toggle('is-open');
    document.body.classList.toggle('gymbro-menu-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
}

function closeGymbroMenu() {
    const menu = document.getElementById('gymbroNavMenu');
    const toggle = document.getElementById('gymbroNavToggle');
    if (!menu || !toggle) return;

    menu.classList.remove('is-open');
    document.body.classList.remove('gymbro-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
}

function checkout() {
    if (cart.length === 0) return;

    const API_BASE = 'https://gymbro-website-production.up.railway.app';
    const endpoint = `${API_BASE}/api/orders`;

    const customerName = prompt('Enter customer name:') || 'Guest';
    if (!customerName) return;

    const customerEmail = (prompt('Enter customer email (gmail):') || '').trim();
    const customerMobile = (prompt('Enter customer mobile number:') || '').trim();
    const paymentMethod = (prompt('Enter payment method (e.g., Card/UPI/COD):') || 'Unknown').trim();

    // Address fields (required)
    const houseNo = (prompt('House / Flat No:') || '').trim();
    const street = (prompt('Street Address:') || '').trim();
    const city = (prompt('City:') || '').trim();
    const state = (prompt('State:') || '').trim();
    const pincode = (prompt('Pincode:') || '').trim();

    // Validate all required fields
    if (!houseNo || !street || !city || !state || !pincode) {
        alert('Please enter complete shipping address details (House No, Street, City, State, Pincode).');
        return;
    }
    if (!/^\d{4,10}$/.test(pincode)) {
        alert('Invalid pincode. Please enter a valid numeric pincode.');
        return;
    }

    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = Math.round(cart.reduce((s, i) => s + (i.price * i.quantity), 0));

    const payload = {
        customer: customerName,
        customerEmail,
        customerMobile,
        paymentMethod,
        items: cart.map(i => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity
        })),
        total: totalAmount,
        totalItems,
        // shipping address
        houseNo,
        street,
        city,
        state,
        pincode,
        date: new Date().toLocaleString('en-IN')
    };

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(async (r) => {
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
                const msg = data?.error || 'Failed to create order';
                throw new Error(msg);
            }
            return data;
        })
        .then((data) => {
            const createdOrder = data?.order;
            const orderId = createdOrder?._id ? String(createdOrder._id) : 'ORDER-' + Date.now();

            alert(`Order ${orderId} created for ${customerName}!\nTotal: ₹${totalAmount} INR\nStatus: Pending\n\nWhatsApp: +61 400 000 000`);

            localStorage.removeItem('gymbroCart');
            cart = [];
            updateCart();
            closeCart();
        })
        .catch((err) => {
            console.error(err);
            alert('Checkout failed. Please try again later.');
        });
}

document.getElementById('cartOverlay').addEventListener('click', closeCart);

// Smooth scroll for hero buttons
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Premium-feel scroll to the top of the PRODUCTS section.
    // Use scrollIntoView exactly as requested to avoid jumpy anchor behavior.
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });

}

// PROFESSIONAL PRODUCT FILTERING - Scoped to .product-grid only
function filterProducts(category, clickedButton = null) {

    const buttons = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-grid .product-card'); // Scoped to grid only

    // Active button management
    buttons.forEach(btn => btn.classList.remove('active'));
    if (clickedButton) clickedButton.classList.add('active');

    // Professional filtering with smooth transitions
    products.forEach((product, index) => {
        const matchesCategory = category === 'all' || product.dataset.category === category;

        if (matchesCategory) {
            product.style.display = 'block';
            product.style.opacity = '0';
            product.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => {
                product.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                product.style.opacity = '1';
                product.style.transform = 'translateY(0) scale(1)';
            }, 50 * index); // Staggered animation
        } else {
            product.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            product.style.opacity = '0';
            product.style.transform = 'translateY(10px) scale(0.98)';
            setTimeout(() => {
                product.style.display = 'none';
            }, 250);
        }
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    // Cart initialization
    updateCart();

    // Load products from MongoDB via /api/products
    // (API_BASE is defined near the top of this file; set it to your backend URL.)
    loadProducts();

    // Filter button event listeners (supports data-filter + data-category for compatibility)

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.dataset.filter || this.dataset.category;
            if (!category) return;
            filterAndScroll(category);
        });
    });

    // Initialize "All" filter active
    const allButton = document.querySelector('.filter-btn[data-category="all"]');
    if (allButton) allButton.classList.add('active');

    // Mobile hamburger toggle
    const navToggle = document.getElementById('gymbroNavToggle');
    const navMenu = document.getElementById('gymbroNavMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', toggleGymbroMenu);
    }

    // Navbar scroll effects
    window.addEventListener('scroll', () => {
        document.querySelector('.gymbro-navbar')?.classList.toggle('gymbro-navbar--scrolled', window.scrollY > 50);
    }, { passive: true });

    // Story section reveal
    const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.story-reveal').forEach(el => storyObserver.observe(el));
});

// COLLECTIONS → PRODUCTS FILTERING ENHANCEMENT
function filterAndScroll(category) {
    // Ensure filter click doesn't trigger any anchor hash/navigation.
    // (Buttons/links are handled by event.preventDefault() where applicable.)
    filterProducts(category);


    // Activate filter button
    const filterBtn = document.querySelector(`.filter-btn[data-category="${category}"], .filter-btn[data-filter="${category}"]`);
    if (filterBtn) filterBtn.classList.add('active');

    // Activate collection card
    const collectionCard = document.querySelector(`.collection-card[data-filter="${category}"]`);
    if (collectionCard) collectionCard.classList.add('active');

    // Remove active from others
    document.querySelectorAll('.filter-btn, .collection-card').forEach(el => {
        if (el !== filterBtn && el !== collectionCard) el.classList.remove('active');
    });

    scrollToSection('products');
}


// Delegated add-to-cart click handling (works for dynamically rendered buttons)
// Prevent duplicate bindings by using a single document-level listener.
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-cart');
    if (!btn) return;
    if (btn.disabled) return;

    const productInfo = btn.closest('.product-info');
    if (!productInfo) return;

    const name = btn.dataset.name;
    const rawPrice = btn.dataset.price;

    const price = Number(rawPrice);
    if (!name || Number.isNaN(price)) return;

    addToCart(name, price, e);
});


