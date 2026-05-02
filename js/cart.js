// =============================================================
//  Glassico — Cart Module
//  localStorage key: 'glassico_cart'
//  Cart item shape: { id, name, brand, price, image_url, qty }
// =============================================================

const CART_KEY = 'glassico_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(arr) {
  localStorage.setItem(CART_KEY, JSON.stringify(arr));
  updateBadge();
}

function addItem(product, qty = 1) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === product.id);

  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({
      id:        product.id,
      name:      product.name,
      brand:     product.brand      || '',
      subtitle:  product.subtitle   || '',
      price:     parseFloat(product.price),
      image_url: product.image_url  || '',
      qty,
    });
  }

  saveCart(cart);
  flashBadge();
}

function removeItem(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function updateQty(id, qty) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === id);
  if (idx === -1) return;

  if (qty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].qty = qty;
  }
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateBadge();
}

function getTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getItemCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateBadge() {
  const count = getItemCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function flashBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.classList.remove('badge-flash');
    void el.offsetWidth; // reflow
    el.classList.add('badge-flash');
  });
}

// Run on every page load
document.addEventListener('DOMContentLoaded', updateBadge);

// Expose globally
window.Cart = { getCart, saveCart, addItem, removeItem, updateQty, clearCart, getTotal, getItemCount, updateBadge };
