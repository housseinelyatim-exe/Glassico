// =============================================================
//  Glassico — Product Detail Page
// =============================================================

(function () {
  'use strict';

  let currentProduct = null;

  // ── Fetch product ─────────────────────────────────────────────
  async function loadProduct(id) {
    try {
      const res  = await fetch(`api/products.php?action=single&id=${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Product not found.');
      return json.data;
    } catch (err) {
      showError(err.message);
      return null;
    }
  }

  // ── Render ────────────────────────────────────────────────────
  function render(p) {
    currentProduct = p;

    // Badge
    const badgeEl = document.getElementById('product-badge');
    if (badgeEl) {
      if (p.badge === 'new') {
        badgeEl.innerHTML = `<span class="badge badge-dark">New Arrival</span>`;
      } else if (p.badge === 'bestseller') {
        badgeEl.innerHTML = `<span class="badge badge-gold">Bestseller</span>`;
      } else {
        badgeEl.innerHTML = '';
      }
    }

    setText('product-name',     p.name);
    setText('product-subtitle', p.subtitle || '');
    setText('product-price',    `${parseFloat(p.price).toFixed(2)} TND`);
    setText('product-desc',     p.description || '');
    setText('spec-measurements',p.measurements || '—');
    setText('spec-material',    p.material || '—');
    setText('spec-brand',       p.brand || '—');
    setText('spec-sku',         p.sku || '—');
    setText('spec-gender',      p.gender ? capitalize(p.gender) : '—');
    setText('spec-color',       p.color || '—');

    // Update document title
    document.title = `${p.name} — Glassico`;

    // Images
    const imgSrc = p.image_url || 'images/placeholder.svg';
    setImage('gallery-main-img', imgSrc, p.name);

    const thumbs = document.querySelectorAll('.gallery__thumb');
    thumbs.forEach((t, i) => {
      const img = t.querySelector('img');
      if (img) img.src = imgSrc; // same image for both thumbs (no multiple images in schema)
      t.addEventListener('click', () => {
        setImage('gallery-main-img', img?.src || imgSrc, p.name);
        thumbs.forEach(th => th.classList.remove('active'));
        t.classList.add('active');
      });
    });
    if (thumbs[0]) thumbs[0].classList.add('active');

    // Stock indicator
    const stockEl = document.getElementById('product-stock');
    if (stockEl) {
      if (p.stock <= 0) {
        stockEl.innerHTML = `<span class="badge badge-gray">Out of Stock</span>`;
        document.getElementById('btn-add-to-cart')?.setAttribute('disabled', 'disabled');
      } else if (p.stock <= 4) {
        stockEl.innerHTML = `<span class="badge badge-amber">Only ${p.stock} left</span>`;
      } else {
        stockEl.innerHTML = `<span class="badge badge-green">In Stock</span>`;
      }
    }
  }

  // ── Add to cart ───────────────────────────────────────────────
  function bindAddToCart() {
    const btn = document.getElementById('btn-add-to-cart');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (!currentProduct) return;
      if (window.Cart) {
        window.Cart.addItem(currentProduct, 1);
        // Flash effect on button
        btn.textContent = '✓ ADDED';
        btn.style.background = '#2E7D32';
        setTimeout(() => {
          btn.textContent = 'ADD TO CART';
          btn.style.background = '';
        }, 1400);
        showToast(`"${currentProduct.name}" added to your bag.`);
      }
    });
  }

  // ── Wishlist toggle ───────────────────────────────────────────
  function bindWishlist() {
    const btn = document.getElementById('btn-wishlist');
    if (!btn) return;

    const wishlist = getWishlist();
    if (currentProduct && wishlist.includes(currentProduct.id)) {
      btn.textContent  = '♥';
      btn.style.color  = 'var(--gold)';
      btn.style.borderColor = 'var(--gold)';
    }

    btn.addEventListener('click', () => {
      if (!currentProduct) return;
      const wl  = getWishlist();
      const idx = wl.indexOf(currentProduct.id);
      if (idx > -1) {
        wl.splice(idx, 1);
        btn.textContent  = '♡';
        btn.style.color  = '';
        btn.style.borderColor = '';
        showToast('Removed from wishlist.');
      } else {
        wl.push(currentProduct.id);
        btn.textContent  = '♥';
        btn.style.color  = 'var(--gold)';
        btn.style.borderColor = 'var(--gold)';
        showToast('Saved to wishlist.');
      }
      localStorage.setItem('glassico_wishlist', JSON.stringify(wl));
    });
  }

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem('glassico_wishlist')) || [];
    } catch { return []; }
  }

  // ── Helpers ───────────────────────────────────────────────────
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setImage(id, src, alt) {
    const el = document.getElementById(id);
    if (el) { el.src = src; el.alt = alt; }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function showError(msg) {
    const container = document.getElementById('product-detail-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;padding:80px 0;">
          <div style="font-size:40px;margin-bottom:16px;">😞</div>
          <h2>Product Not Found</h2>
          <p style="color:var(--muted);margin-top:8px;">${msg}</p>
          <a href="shop.html" class="btn-dark mt-24" style="display:inline-flex;margin-top:24px;">BACK TO SHOP</a>
        </div>`;
    }
  }

  function showToast(msg) {
    let toast = document.getElementById('glassico-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'glassico-toast';
      toast.style.cssText = `
        position:fixed;bottom:32px;right:32px;z-index:9999;
        background:var(--dark);color:#fff;
        padding:14px 24px;border-radius:8px;
        font-size:13px;font-weight:500;
        opacity:0;transform:translateY(12px);
        transition:opacity 0.25s,transform 0.25s;
        pointer-events:none;max-width:300px;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
    }, 2800);
  }

  // ── Init ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id     = parseInt(params.get('id'), 10);

    if (!id) {
      showError('No product ID specified.');
      return;
    }

    const product = await loadProduct(id);
    if (!product) return;

    render(product);
    bindAddToCart();
    bindWishlist();
  });
})();
