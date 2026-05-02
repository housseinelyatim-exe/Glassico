// =============================================================
//  Glassico — Shop Page
// =============================================================

(function () {
  'use strict';

  const state = {
    page:    1,
    filters: {},
    sort:    'featured',
    total:   0,
    loading: false,
  };

  const COLORS = {
    'Black':   '#1A1A1A',
    'Havana':  '#5C3317',
    'Gold':    '#B8922A',
    'Silver':  '#9E9E9E',
    'Onyx':    '#2C2C2C',
    'Amber':   '#D4821A',
    'Crystal': '#D6EAF8',
  };

  let debounceTimer = null;

  function debounce(fn, ms = 300) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
  }

  // ── Build query string ────────────────────────────────────────
  function buildQuery() {
    const f   = state.filters;
    const qs  = new URLSearchParams();

    qs.set('action', 'list');
    qs.set('page',   state.page);
    qs.set('limit',  '12');
    qs.set('sort',   state.sort);

    if (f.gender)    qs.set('gender',    f.gender);
    if (f.brand)     qs.set('brand',     f.brand);
    if (f.shape)     qs.set('shape',     f.shape);
    if (f.color)     qs.set('color',     f.color);
    if (f.price_min) qs.set('price_min', f.price_min);
    if (f.price_max) qs.set('price_max', f.price_max);
    if (f.search)    qs.set('search',    f.search);

    return qs.toString();
  }

  // ── Fetch & render ────────────────────────────────────────────
  async function loadProducts(append = false) {
    if (state.loading) return;
    state.loading = true;

    const grid    = document.getElementById('products-grid');
    const loadBtn = document.getElementById('load-more-btn');
    const countEl = document.getElementById('product-count');

    if (!append) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted);">Loading…</div>';
    }

    try {
      const res  = await fetch('api/products.php?' + buildQuery());
      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      const { products, total, total_pages } = json.data;
      state.total = total;

      if (!append) grid.innerHTML = '';

      if (products.length === 0 && !append) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:60px;">
            <div style="font-size:40px;margin-bottom:12px;">🔍</div>
            <p style="font-size:16px;color:var(--muted);">No frames found for this selection.</p>
          </div>`;
      } else {
        products.forEach(p => grid.appendChild(createCard(p)));
      }

      if (countEl) countEl.textContent = `${total} frame${total !== 1 ? 's' : ''}`;
      if (loadBtn) loadBtn.style.display = state.page < total_pages ? 'inline-flex' : 'none';

    } catch (err) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--danger);">Failed to load products. ${err.message}</div>`;
    } finally {
      state.loading = false;
    }
  }

  // ── Create product card element ───────────────────────────────
  function createCard(p) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', p.id);

    const imgSrc = p.image_url || 'images/placeholder.svg';

    let badgeHtml = '';
    if (p.badge === 'bestseller') {
      badgeHtml = `<div class="product-card__badge"><span class="badge badge-gold">Bestseller</span></div>`;
    } else if (p.badge === 'new') {
      badgeHtml = `<div class="product-card__badge"><span class="badge badge-dark">New</span></div>`;
    }

    card.innerHTML = `
      <div class="product-card__image-wrap">
        <img src="${imgSrc}" alt="${escHtml(p.name)}" loading="lazy">
        <div class="product-card__quick-add" data-id="${p.id}">+ QUICK ADD</div>
      </div>
      <div class="product-card__body">
        ${badgeHtml}
        <div class="product-card__name">${escHtml(p.name)}</div>
        <div class="product-card__brand">${escHtml(p.brand || '')}</div>
        <div class="product-card__price">$${parseFloat(p.price).toFixed(2)}</div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.product-card__quick-add')) {
        e.stopPropagation();
        quickAdd(p);
        return;
      }
      window.location.href = `product.html?id=${p.id}`;
    });

    return card;
  }

  function quickAdd(p) {
    if (window.Cart) {
      window.Cart.addItem(p, 1);
      showToast(`"${p.name}" added to cart.`);
    }
  }

  // ── Filters ───────────────────────────────────────────────────
  function resetPage() {
    state.page = 1;
    const grid = document.getElementById('products-grid');
    if (grid) grid.innerHTML = '';
  }

  function bindCheckboxes(name, filterKey) {
    document.querySelectorAll(`input[data-filter="${filterKey}"]`).forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = [...document.querySelectorAll(`input[data-filter="${filterKey}"]:checked`)]
          .map(c => c.value);
        state.filters[filterKey] = checked.length === 1 ? checked[0] : (checked.length > 1 ? checked.join(',') : '');
        resetPage();
        updateFilterPills();
        debounce(loadProducts);
      });
    });
  }

  function bindPriceSlider() {
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    const minDisplay = document.getElementById('price-min-display');
    const maxDisplay = document.getElementById('price-max-display');
    const fill = document.getElementById('price-fill');

    if (!minInput || !maxInput) return;

    function updateFill() {
      const min = parseInt(minInput.value);
      const max = parseInt(maxInput.value);
      const rangeMin = parseInt(minInput.min);
      const rangeMax = parseInt(minInput.max);
      const pct1 = ((min - rangeMin) / (rangeMax - rangeMin)) * 100;
      const pct2 = ((max - rangeMin) / (rangeMax - rangeMin)) * 100;
      if (fill) {
        fill.style.left  = pct1 + '%';
        fill.style.width = (pct2 - pct1) + '%';
      }
    }

    function onSliderChange() {
      let min = parseInt(minInput.value);
      let max = parseInt(maxInput.value);
      if (min > max) { min = max; minInput.value = min; }
      if (minDisplay) minDisplay.textContent = '$' + min;
      if (maxDisplay) maxDisplay.textContent = '$' + max;
      updateFill();
      state.filters.price_min = min;
      state.filters.price_max = max;
      resetPage();
      updateFilterPills();
      debounce(loadProducts);
    }

    minInput.addEventListener('input', onSliderChange);
    maxInput.addEventListener('input', onSliderChange);
    updateFill();
  }

  function bindSort() {
    const select = document.getElementById('sort-select');
    if (!select) return;
    select.addEventListener('change', () => {
      state.sort = select.value;
      resetPage();
      loadProducts();
    });
  }

  function bindSearch() {
    const input = document.getElementById('shop-search');
    if (!input) return;
    input.addEventListener('input', () => {
      state.filters.search = input.value.trim();
      resetPage();
      debounce(loadProducts, 400);
    });
  }

  function bindLoadMore() {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      state.page += 1;
      loadProducts(true);
    });
  }

  // ── Color swatches ────────────────────────────────────────────
  function buildColorSwatches() {
    const wrap = document.getElementById('color-swatches');
    if (!wrap) return;

    Object.entries(COLORS).forEach(([name, hex]) => {
      const s = document.createElement('div');
      s.className = 'color-swatch';
      s.style.background = hex;
      s.title = name;
      s.dataset.color = name;
      s.addEventListener('click', () => {
        if (state.filters.color === name) {
          state.filters.color = '';
          s.classList.remove('active');
        } else {
          wrap.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
          s.classList.add('active');
          state.filters.color = name;
        }
        resetPage();
        updateFilterPills();
        debounce(loadProducts);
      });
      wrap.appendChild(s);
    });
  }

  // ── Filter pills ──────────────────────────────────────────────
  const FILTER_LABELS = {
    gender:    'Gender',
    brand:     'Brand',
    shape:     'Shape',
    color:     'Color',
    price_min: 'Min $',
    price_max: 'Max $',
    search:    'Search',
  };

  function updateFilterPills() {
    const container = document.getElementById('filter-pills');
    if (!container) return;

    container.innerHTML = '';
    let hasAny = false;

    Object.entries(state.filters).forEach(([key, val]) => {
      if (!val && val !== 0) return;
      hasAny = true;

      const pill = document.createElement('div');
      pill.className = 'filter-pill';
      pill.innerHTML = `${FILTER_LABELS[key] || key}: <strong>${val}</strong>
        <button class="filter-pill__remove" data-key="${key}" title="Remove filter">×</button>`;
      container.appendChild(pill);
    });

    if (hasAny) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'filter-clear';
      clearBtn.textContent = 'CLEAR ALL';
      clearBtn.addEventListener('click', clearAllFilters);
      container.appendChild(clearBtn);
    }

    container.querySelectorAll('.filter-pill__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        delete state.filters[key];
        // Uncheck matching checkbox
        document.querySelectorAll(`input[data-filter="${key}"]`).forEach(cb => cb.checked = false);
        // Deactivate color swatch
        if (key === 'color') {
          document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        }
        resetPage();
        updateFilterPills();
        loadProducts();
      });
    });
  }

  function clearAllFilters() {
    state.filters = {};
    document.querySelectorAll('input[data-filter]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    if (minInput) minInput.value = minInput.min;
    if (maxInput) maxInput.value = maxInput.max;
    const minD = document.getElementById('price-min-display');
    const maxD = document.getElementById('price-max-display');
    if (minD) minD.textContent = '$' + (minInput?.min || '100');
    if (maxD) maxD.textContent = '$' + (maxInput?.max || '1000');
    const fill = document.getElementById('price-fill');
    if (fill) { fill.style.left = '0%'; fill.style.width = '100%'; }
    resetPage();
    updateFilterPills();
    loadProducts();
  }

  // ── Helpers ───────────────────────────────────────────────────
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('products-grid')) return;

    buildColorSwatches();
    bindCheckboxes('gender', 'gender');
    bindCheckboxes('brand', 'brand');
    bindCheckboxes('shape', 'shape');
    bindPriceSlider();
    bindSort();
    bindSearch();
    bindLoadMore();
    loadProducts();
  });
})();
