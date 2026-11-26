// Application State
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('novamart_cart')) || [];
let activeCategory = 'all';
let searchTerm = '';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const categoryButtons = document.querySelectorAll('.cat-btn');
const searchInput = document.getElementById('searchInput');

// Cart Elements
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartBadge = document.getElementById('cartBadge');
const subtotalAmount = document.getElementById('subtotalAmount');
const taxAmount = document.getElementById('taxAmount');
const shippingAmount = document.getElementById('shippingAmount');
const totalAmount = document.getElementById('totalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');

// Modal Elements
const checkoutModal = document.getElementById('checkoutModal');
const modalPaidAmount = document.getElementById('modalPaidAmount');
const closeModalBtn = document.getElementById('closeModalBtn');

// 1. Fetch Products from FakeStoreAPI
async function fetchProducts() {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error('Failed to fetch product catalog.');
    allProducts = await response.json();
    loader.classList.add('hidden');
    renderProducts();
  } catch (error) {
    loader.classList.add('hidden');
    errorMessage.textContent = `Error: ${error.message}`;
    errorMessage.classList.remove('hidden');
  }
}

// 2. Render Filtered Products
function renderProducts() {
  const filtered = allProducts.filter(product => {
    const matchesCat = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#64748b;">No matching products found.</p>';
    return;
  }

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div>
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.title}" loading="lazy" />
        </div>
        <div class="product-cat">${product.category}</div>
        <h3 class="product-title" title="${product.title}">${product.title}</h3>
        <div class="product-rating">
          <i class="fas fa-star"></i> ${product.rating.rate} (${product.rating.count} reviews)
        </div>
      </div>
      <div class="product-footer">
        <span class="product-price">$${product.price.toFixed(2)}</span>
        <button class="add-btn" onclick="addToCart(${product.id})">
          <i class="fas fa-cart-plus"></i> Add
        </button>
      </div>
    </article>
  `).join('');
}

// 3. Category & Search Event Listeners
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.getAttribute('data-category');
    renderProducts();
  });
});

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value.toLowerCase();
  renderProducts();
});

// 4. Cart Actions
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveAndRenderCart();
  openDrawer();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveAndRenderCart();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveAndRenderCart();
}

function saveAndRenderCart() {
  localStorage.setItem('novamart_cart', JSON.stringify(cart));
  renderCart();
}

// 5. Render Cart Drawer & Calculate Totals
function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your shopping cart is empty.</p>';
    checkoutBtn.disabled = true;
    updateTotals(0);
    return;
  }

  checkoutBtn.disabled = false;

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" />
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item-btn" title="Remove" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  const tax = subtotal * 0.05; // 5% tax
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 10) : 0; // Free shipping over $100
  const total = subtotal + tax + shipping;

  subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
  taxAmount.textContent = `$${tax.toFixed(2)}`;
  shippingAmount.textContent = subtotal >= 100 ? 'FREE' : `$${shipping.toFixed(2)}`;
  totalAmount.textContent = `$${total.toFixed(2)}`;
  modalPaidAmount.textContent = `$${total.toFixed(2)}`;
}

// 6. Drawer & Checkout Modal Controls
function openDrawer() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}

function closeDrawer() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

openCartBtn.addEventListener('click', openDrawer);
closeCartBtn.addEventListener('click', closeDrawer);
cartOverlay.addEventListener('click', closeDrawer);

checkoutBtn.addEventListener('click', () => {
  closeDrawer();
  checkoutModal.classList.add('active');
  cart = [];
  saveAndRenderCart();
});

closeModalBtn.addEventListener('click', () => {
  checkoutModal.classList.remove('active');
});

// Initialize
fetchProducts();
renderCart();