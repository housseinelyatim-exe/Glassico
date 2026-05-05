
(function () {
  'use strict';

  let inventoryPage = 1;
  let ordersPage    = 1;
  let editingId     = null;

  async function guardAdmin() {
    try {
      const res  = await fetch('api/auth.php?action=session');
      const json = await res.json();
      if (!json.success || !json.data?.is_admin) {
        window.location.href = 'auth.html';
        return false;
      }
      return true;
    } catch {
      window.location.href = 'auth.html';
      return false;
    }
  }

  async function loadDashboard() {
    try {
      const res  = await fetch('admin/dashboard.php');
      if (res.status === 401 || res.status === 403) { window.location.href = 'auth.html'; return; }
      const json = await res.json();
      if (!json.success) return;

      const d = json.data;
      setText('stat-sales',   parseFloat(d.total_sales_mtd || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})+'TND');
      setText('stat-orders',  d.active_orders);
      setText('stat-stock',   d.low_stock);

      // Recent orders table
      const tbody = document.getElementById('recent-orders-tbody');
      if (tbody && d.recent_orders) {
        tbody.innerHTML = d.recent_orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>${escHtml(o.customer_email || '—')}</td>
            <td>${parseFloat(o.total).toFixed(2)} TND</td>
            <td><span class="status-pill ${o.status}">${capitalize(o.status)}</span></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }

  async function loadInventory(page = 1) {
    inventoryPage = page;
    const compactSearch = document.getElementById('inventory-search')?.value.trim() || '';
    const fullSearch    = document.getElementById('inventory-search-full')?.value.trim() || '';
    const search        = fullSearch || compactSearch;

    try {
      const res  = await fetch(`admin/products.php?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (!json.success) return;

      const { products, total, total_pages } = json.data;
      const tbodyCompact = document.getElementById('inventory-tbody');
      const tbodyFull    = document.getElementById('inventory-tbody-full');
      if (!tbodyCompact && !tbodyFull) return;

      const compactRows = products.map(p => {
        const stockPill = p.stock <= 0
          ? `<span class="status-pill out-stock">Out of Stock</span>`
          : p.stock <= 4
            ? `<span class="status-pill low-stock">Low Stock</span>`
            : `<span class="status-pill in-stock">In Stock</span>`;
        const img = p.image_url || 'images/placeholder.svg';
        return `
          <tr>
            <td>
              <div class="admin-table__item">
                <div class="admin-table__thumb"><img src="${img}" alt="${escHtml(p.name)}"></div>
                <div>
                  <div class="admin-table__name">${escHtml(p.name)}</div>
                  <div class="admin-table__brand">${escHtml(p.brand || '')}</div>
                </div>
              </div>
            </td>
            <td>${escHtml(p.sku || '—')}</td>
            <td>${p.stock}</td>
            <td>${stockPill}</td>
            <td>
              <button class="admin-table__action" onclick="window._adminEditProduct(${p.id})" title="Edit"><img src="images/curated.png" alt="curated" style="width: 24px; vertical-align: middle;"></button>
              <button class="admin-table__action" onclick="window._adminDeleteProduct(${p.id}, '${escHtml(p.name)}')" title="Delete" style="margin-left:4px;"><img src="images/curated.png" alt="curated" style="width: 24px; vertical-align: middle;"></button>
            </td>
          </tr>`;
      }).join('');

      const fullRows = products.map(p => {
        const stockPill = p.stock <= 0
          ? `<span class="status-pill out-stock">Out of Stock</span>`
          : p.stock <= 4
            ? `<span class="status-pill low-stock">Low Stock</span>`
            : `<span class="status-pill in-stock">In Stock</span>`;
        const img = p.image_url || 'images/placeholder.svg';
        return `
          <tr>
            <td>
              <div class="admin-table__item">
                <div class="admin-table__thumb"><img src="${img}" alt="${escHtml(p.name)}"></div>
                <div>
                  <div class="admin-table__name">${escHtml(p.name)}</div>
                  <div class="admin-table__brand">${escHtml(p.brand || '')}</div>
                </div>
              </div>
            </td>
            <td>${escHtml(p.sku || '—')}</td>
            <td>${parseFloat(p.price || 0).toFixed(2)} TND</td>
            <td>${p.stock}</td>
            <td>${stockPill}</td>
            <td>
              <button class="admin-table__action" onclick="window._adminEditProduct(${p.id})" title="Edit"><img src="images/curated.png" alt="curated" style="width: 24px; vertical-align: middle;"></button>
              <button class="admin-table__action" onclick="window._adminDeleteProduct(${p.id}, '${escHtml(p.name)}')" title="Delete" style="margin-left:4px;"><img src="images/curated.png" alt="curated" style="width: 24px; vertical-align: middle;"></button>
            </td>
          </tr>`;
      }).join('');

      if (tbodyCompact) {
        tbodyCompact.innerHTML = products.length === 0
          ? `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted);">No products found.</td></tr>`
          : compactRows;
      }

      if (tbodyFull) {
        tbodyFull.innerHTML = products.length === 0
          ? `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--muted);">No products found.</td></tr>`
          : fullRows;
      }

      const pageText = `Page ${page} of ${total_pages || 1} (${total} items)`;
      setText('inventory-pagination-info', pageText);
      setText('inventory-pagination-info-full', pageText);
      const disablePrev = page <= 1;
      const disableNext = page >= (total_pages || 1);
      const prevBtn = document.getElementById('inventory-prev');
      const nextBtn = document.getElementById('inventory-next');
      const prevBtnFull = document.getElementById('inventory-prev-full');
      const nextBtnFull = document.getElementById('inventory-next-full');
      if (prevBtn) prevBtn.disabled = disablePrev;
      if (nextBtn) nextBtn.disabled = disableNext;
      if (prevBtnFull) prevBtnFull.disabled = disablePrev;
      if (nextBtnFull) nextBtnFull.disabled = disableNext;

    } catch (err) {
      console.error('Inventory load error:', err);
    }
  }

  // ── Orders table ──────────────────────────────────────────────
  async function loadOrders(page = 1) {
    ordersPage = page;
    try {
      const res  = await fetch(`admin/orders.php?page=${page}&limit=15`);
      const json = await res.json();
      if (!json.success) return;

      const { orders, total, total_pages } = json.data;
      const tbody = document.getElementById('orders-tbody');
      if (!tbody) return;

      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted);">No orders yet.</td></tr>`;
      } else {
        tbody.innerHTML = orders.map(o => {
          const statusOptions = ['pending','processing','shipped','delivered','cancelled']
            .map(s => `<option value="${s}"${o.status===s?' selected':''}>${capitalize(s)}</option>`)
            .join('');
          return `
            <tr>
              <td>#${o.id}</td>
              <td>${escHtml(o.customer_email || '—')}</td>
              <td>${formatDate(o.created_at)}</td>
              <td>${parseFloat(o.total || 0).toFixed(2)} TND</td>
              <td>
                <select class="status-select" data-order-id="${o.id}" onchange="window._adminUpdateOrderStatus(${o.id}, this.value)">
                  ${statusOptions}
                </select>
              </td>
            </tr>`;
        }).join('');
      }

      setText('orders-pagination-info', `Page ${page} of ${total_pages || 1} (${total} orders)`);
      const prevBtn = document.getElementById('orders-prev');
      const nextBtn = document.getElementById('orders-next');
      if (prevBtn) prevBtn.disabled = page <= 1;
      if (nextBtn) nextBtn.disabled = page >= (total_pages || 1);

    } catch (err) {
      console.error('Orders load error:', err);
    }
  }

  window._adminUpdateOrderStatus = async function (id, status) {
    try {
      const res  = await fetch(`admin/orders.php?id=${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) showToast('Error: ' + json.error, 'error');
      else showToast('Order status updated.');
    } catch { showToast('Network error.', 'error'); }
  };

  function openModal(product = null) {
    editingId = product ? product.id : null;
    const modal    = document.getElementById('product-modal');
    const overlay  = document.getElementById('modal-overlay');
    const title    = document.getElementById('modal-title');
    const form     = document.getElementById('product-form');

    if (!modal || !overlay || !form) return;

    title.textContent = product ? 'Edit Product' : 'Add New Product';
    form.reset();
    document.getElementById('modal-image-url').value = '';
    document.getElementById('modal-image-preview').src = 'images/placeholder.svg';

    if (product) {
      setFormField('modal-name',         product.name);
      setFormField('modal-brand',        product.brand);
      setFormField('modal-subtitle',     product.subtitle);
      setFormField('modal-sku',          product.sku);
      setFormField('modal-price',        product.price);
      setFormField('modal-stock',        product.stock);
      setFormField('modal-gender',       product.gender);
      setFormField('modal-frame-shape',  product.frame_shape);
      setFormField('modal-color',        product.color);
      setFormField('modal-badge',        product.badge || '');
      setFormField('modal-material',     product.material);
      setFormField('modal-measurements', product.measurements);
      setFormField('modal-description',  product.description);
      document.getElementById('modal-image-url').value = product.image_url || '';
      if (product.image_url) {
        document.getElementById('modal-image-preview').src = product.image_url;
      }
    }

    overlay.classList.add('open');
    modal.classList.add('open');
  }

  function closeModal() {
    document.getElementById('modal-overlay')?.classList.remove('open');
    document.getElementById('product-modal')?.classList.remove('open');
    editingId = null;
  }

  window._adminEditProduct = async function (id) {
    try {
      const res  = await fetch(`admin/products.php?page=1&limit=1&id=${id}`);
      // Fetch single via public API
      const res2 = await fetch(`api/products.php?action=single&id=${id}`);
      const json = await res2.json();
      if (json.success) openModal(json.data);
    } catch { showToast('Could not load product.', 'error'); }
  };

  window._adminDeleteProduct = async function (id, name) {
    if (!confirm(`Delete "${name}" permanently? This cannot be undone.`)) return;
    try {
      const res  = await fetch(`admin/products.php?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { showToast('Product deleted.'); loadInventory(inventoryPage); }
      else showToast('Error: ' + json.error, 'error');
    } catch { showToast('Network error.', 'error'); }
  };

  function bindImageUpload() {
    const input   = document.getElementById('modal-image-file');
    const preview = document.getElementById('modal-image-preview');
    const hidden  = document.getElementById('modal-image-url');
    const status  = document.getElementById('modal-image-status');
    if (!input) return;

    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;

      if (status) { status.textContent = 'Uploading…'; status.style.color = 'var(--muted)'; }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res  = await fetch('api/upload.php', { method: 'POST', body: formData });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        hidden.value    = json.data.url;
        preview.src     = json.data.url;
        if (status) { status.textContent = '✓ Uploaded'; status.style.color = '#2E7D32'; }
      } catch (err) {
        if (status) { status.textContent = 'Upload failed: ' + err.message; status.style.color = 'var(--danger)'; }
      }
    });
  }

  function bindProductForm() {
    const form = document.getElementById('product-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const body = {
        name:         getFormField('modal-name'),
        brand:        getFormField('modal-brand'),
        subtitle:     getFormField('modal-subtitle'),
        sku:          getFormField('modal-sku'),
        price:        parseFloat(getFormField('modal-price')) || 0,
        stock:        parseInt(getFormField('modal-stock'), 10) || 0,
        gender:       getFormField('modal-gender')      || null,
        frame_shape:  getFormField('modal-frame-shape') || null,
        color:        getFormField('modal-color'),
        badge:        getFormField('modal-badge')       || null,
        material:     getFormField('modal-material'),
        measurements: getFormField('modal-measurements'),
        description:  getFormField('modal-description'),
        image_url:    document.getElementById('modal-image-url')?.value || '',
      };

      const url    = editingId ? `admin/products.php?id=${editingId}` : 'admin/products.php';
      const method = editingId ? 'PATCH' : 'POST';

      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'SAVING…'; }

      try {
        const res  = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        showToast(editingId ? 'Product updated.' : 'Product created.');
        closeModal();
        loadInventory(inventoryPage);

      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'SAVE PRODUCT'; }
      }
    });
  }

  function bindBanner() {
    const publishBtn = document.getElementById('banner-publish');
    const textarea   = document.getElementById('banner-text');
    const checkbox   = document.getElementById('banner-enable');
    if (!publishBtn || !textarea) return;

    // Load saved
    const saved = JSON.parse(localStorage.getItem('glassico_banner') || '{}');
    if (saved.text)    textarea.value   = saved.text;
    if (saved.enabled && checkbox) checkbox.checked = saved.enabled;

    publishBtn.addEventListener('click', () => {
      const bannerData = { text: textarea.value.trim(), enabled: checkbox?.checked || false };
      localStorage.setItem('glassico_banner', JSON.stringify(bannerData));
      showToast('Banner published.');

      const bar = document.querySelector('.announcement-bar');
      if (bar && bannerData.enabled && bannerData.text) {
        bar.textContent = bannerData.text;
      }
    });
  }

  function bindSidebarNav() {
    const items = document.querySelectorAll('.admin-nav__item');
    const views = document.querySelectorAll('.admin-view');

    items.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.view;
        if (!target) return;

        items.forEach(i => i.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        item.classList.add('active');
        const view = document.getElementById('view-' + target);
        if (view) view.classList.add('active');

        // Lazy-load on first visit
        if (target === 'inventory') loadInventory(1);
        if (target === 'orders')    loadOrders(1);
      });
    });
  }

  function bindInventorySearch() {
    let t;
    const compact = document.getElementById('inventory-search');
    const full    = document.getElementById('inventory-search-full');
    const bind = (input) => {
      if (!input) return;
      input.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => { inventoryPage = 1; loadInventory(1); }, 350);
      });
    };
    bind(compact);
    bind(full);
  }

  function bindPagination() {
    document.getElementById('inventory-prev')?.addEventListener('click', () => loadInventory(inventoryPage - 1));
    document.getElementById('inventory-next')?.addEventListener('click', () => loadInventory(inventoryPage + 1));
    document.getElementById('inventory-prev-full')?.addEventListener('click', () => loadInventory(inventoryPage - 1));
    document.getElementById('inventory-next-full')?.addEventListener('click', () => loadInventory(inventoryPage + 1));
    document.getElementById('orders-prev')?.addEventListener('click', () => loadOrders(ordersPage - 1));
    document.getElementById('orders-next')?.addEventListener('click', () => loadOrders(ordersPage + 1));
  }

  // ── Logout ────────────────────────────────────────────────────
  function bindLogout() {
    document.getElementById('admin-logout')?.addEventListener('click', async () => {
      await fetch('api/auth.php?action=logout', { method: 'POST' });
      window.location.href = 'auth.html';
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? '';
  }

  function setFormField(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val ?? '';
  }

  function getFormField(id) {
    return document.getElementById(id)?.value?.trim() || '';
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function showToast(msg, type = 'success') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.style.cssText = `
        position:fixed;bottom:32px;right:32px;z-index:9999;
        padding:14px 24px;border-radius:8px;
        font-size:13px;font-weight:500;color:#fff;
        opacity:0;transform:translateY(12px);
        transition:opacity 0.25s,transform 0.25s;
        pointer-events:none;max-width:320px;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent  = msg;
    toast.style.background = type === 'error' ? 'var(--danger)' : '#2E7D32';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
    }, 3000);
  }

  // ── Init ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    const ok = await guardAdmin();
    if (!ok) return;

    bindSidebarNav();
    bindPagination();
    bindInventorySearch();
    bindProductForm();
    bindImageUpload();
    bindBanner();
    bindLogout();

    // Modal open button
    document.getElementById('btn-new-item')?.addEventListener('click', () => openModal());
    document.getElementById('btn-new-item-inventory')?.addEventListener('click', () => openModal());
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('modal-close')?.addEventListener('click', closeModal);

    // Load default view
    await loadDashboard();
    loadInventory(1);

    window._adminOpenModal = openModal;
  });
})();
