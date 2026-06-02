// Cart functions (existing - enhanced)
const AUD_TO_INR = 55;
let cart = JSON.parse(localStorage.getItem('gymbroCart')) || [];

function addToCart(name, price, event) {
    cart.push({ name, price: price * AUD_TO_INR, quantity: 1 });
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

function checkout() {
    if (cart.length === 0) return;

    const customerName = prompt('Enter customer name:') || 'Guest';
    if (!customerName) return;

    // Admin page enhancement: capture customer email/mobile + payment method.
    // These are stored inside localStorage and rendered in admin.html.
    const customerEmail = (prompt('Enter customer email (gmail):') || '').trim();
    const customerMobile = (prompt('Enter customer mobile number:') || '').trim();
    const paymentMethod = (prompt('Enter payment method (e.g., Card/UPI/COD):') || 'Unknown').trim();

    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = Math.round(cart.reduce((s, i) => s + (i.price * i.quantity), 0));

    const order = {
        id: 'ORDER-' + Date.now(),
        customer: customerName,
        customerEmail,
        customerMobile,
        paymentMethod,
        items: [...cart],
        total: totalAmount,
        totalItems,
        date: new Date().toLocaleString('en-IN'),
        status: 'pending'
    };


    let orders = JSON.parse(localStorage.getItem('gymbroOrders')) || [];
    orders.push(order);
    localStorage.setItem('gymbroOrders', JSON.stringify(orders));

    alert(`Order ${order.id} created for ${customerName}!\nTotal: ₹${totalAmount} INR\nStatus: Pending\n\nWhatsApp: +61 400 000 000`);

    localStorage.removeItem('gymbroCart');
    cart = [];
    updateCart();
    closeCart();
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


// Fix addToCart onclick calls (pass event)
document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const name = this.closest('.product-info').querySelector('.product-name').textContent;
        const priceMatch = this.closest('.product-info').querySelector('.price').textContent.match(/₹([\\d,]+)/);
        const price = parseFloat(priceMatch ? priceMatch[1].replace(/,/g, '') : 0) / AUD_TO_INR;
        addToCart(name, price, e);
    });
});
