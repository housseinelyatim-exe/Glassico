
(function () {
  'use strict';

  const TN_STATES = [
    'Ariana','Beja','Ben Arous','Bizerte','Gabes','Gafsa','Jendouba','Kairouan',
    'Kasserine','Kebili','Le Kef','Mahdia','La Manouba','Medenine','Monastir',
    'Nabeul','Sfax','Sidi Bouzid','Siliana','Sousse','Tataouine','Tozeur','Tunis',
    'Zaghouan',
  ];

  function populateStates() {
    const select = document.getElementById('field-state');
    if (!select) return;
    TN_STATES.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      select.appendChild(opt);
    });
  }

  function renderCartSummary() {
    const cart = window.Cart ? window.Cart.getCart() : getCartFallback();
    const selectionContainer = document.getElementById('checkout-cart-items');
    const summaryContainer   = document.getElementById('order-summary-lines');

    if (cart.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    if (selectionContainer) {
      selectionContainer.innerHTML = cart.map(item => `
        <div class="checkout-cart-item">
          <div class="checkout-cart-item__img">
            <img src="${item.image_url || 'images/placeholder.svg'}" alt="${escHtml(item.name)}">
          </div>
          <div class="checkout-cart-item__name">${escHtml(item.name)}</div>
          <div class="checkout-cart-item__qty">×${item.qty}</div>
          <div class="checkout-cart-item__price">${(item.price * item.qty).toFixed(2)} TND</div>
        </div>
      `).join('');
    }

    // Order Summary totals
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 300 ? 0 : 10;
    const total    = subtotal + shipping;

    if (summaryContainer) {
      summaryContainer.innerHTML = cart.map(item =>
        `<div class="order-line"><span>${escHtml(item.name)} ×${item.qty}</span><span>${(item.price * item.qty).toFixed(2)} TND</span></div>`
      ).join('');
    }

    setText('summary-subtotal', `${subtotal.toFixed(2)} TND`);
    setText('summary-shipping', `${shipping.toFixed(2)}` + ' TND');
    setText('summary-total',    `${total.toFixed(2)} TND`);

    return { subtotal, shipping, total };
  }

  function bindPaymentToggle() {
    const options = document.querySelectorAll('.payment-option');
    const cardFields = document.getElementById('card-fields');

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        if (cardFields) {
          cardFields.style.display = radio?.value === 'credit_card' ? 'grid' : 'none';
        }
      });
    });
  }

  function bindCardFormat() {
    const input = document.getElementById('field-card-number');
    if (!input) return;
    input.addEventListener('input', () => {
      let v = input.value.replace(/\D/g, '').substring(0, 16);
      input.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    const expInput = document.getElementById('field-expiry');
    if (expInput) {
      expInput.addEventListener('input', () => {
        let v = expInput.value.replace(/\D/g, '').substring(0, 4);
        if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2);
        expInput.value = v;
      });
    }
  }

  function setError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-error');
    if (field) field.classList.toggle('error', !!msg);
    if (errEl) errEl.textContent = msg || '';
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input.error, select.error').forEach(el => el.classList.remove('error'));
  }

  function validate() {
    clearErrors();
    let valid = true;

    const email = document.getElementById('field-email')?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('field-email', 'Valid email required.');
      valid = false;
    }

    ['field-first','field-last','field-street','field-city','field-zip'].forEach(id => {
      const val = document.getElementById(id)?.value.trim();
      if (!val) { setError(id, 'Required.'); valid = false; }
    });

    const stateVal = document.getElementById('field-state')?.value;
    if (!stateVal) { setError('field-state', 'Select a state.'); valid = false; }

    const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value;
    if (selectedPayment === 'credit_card') {
      const cardNum = document.getElementById('field-card-number')?.value.replace(/\s/g,'');
      if (!cardNum || cardNum.length !== 16) {
        setError('field-card-number', 'Enter a valid 16-digit card number.');
        valid = false;
      }
      const expiry = document.getElementById('field-expiry')?.value;
      if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        setError('field-expiry', 'Enter MM/YY.');
        valid = false;
      }
      const cvv = document.getElementById('field-cvv')?.value;
      if (!cvv || cvv.length < 3) {
        setError('field-cvv', 'Enter CVV.');
        valid = false;
      }
      const cardName = document.getElementById('field-card-name')?.value.trim();
      if (!cardName) { setError('field-card-name', 'Required.'); valid = false; }
    }

    return valid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const cart = window.Cart ? window.Cart.getCart() : getCartFallback();
    if (cart.length === 0) { alert('Your cart is empty.'); return; }

    const btn = document.getElementById('btn-place-order');
    if (btn) { btn.disabled = true; btn.textContent = 'PLACING ORDER…'; }

    const shippingAddress = {
      email:   document.getElementById('field-email')?.value.trim(),
      first:   document.getElementById('field-first')?.value.trim(),
      last:    document.getElementById('field-last')?.value.trim(),
      street:  document.getElementById('field-street')?.value.trim(),
      apt:     document.getElementById('field-apt')?.value.trim(),
      city:    document.getElementById('field-city')?.value.trim(),
      state:   document.getElementById('field-state')?.value,
      zip:     document.getElementById('field-zip')?.value.trim(),
    };

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'credit_card';

    const body = {
      items:            cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      shipping_address: shippingAddress,
      payment_method:   paymentMethod,
      guest_email:      shippingAddress.email,
    };

    try {
      const res  = await fetch('api/orders.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || 'Order failed.');

      // Success
      if (window.Cart) window.Cart.clearCart();

      document.getElementById('checkout-form-wrapper')?.style && (document.getElementById('checkout-form-wrapper').style.display = 'none');
      document.getElementById('checkout-right')?.style && (document.getElementById('checkout-right').style.display = 'none');

      const confirmation = document.getElementById('order-confirmation');
      if (confirmation) {
        confirmation.style.display = 'block';
        confirmation.classList.add('show');
        setText('confirmation-order-id', `#${json.data.order_id}`);
        setText('confirmation-total',    `${parseFloat(json.data.total).toFixed(2)} TND`);
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (err) {
      const errEl = document.getElementById('checkout-global-error');
      if (errEl) errEl.textContent = err.message;
      if (btn) { btn.disabled = false; btn.textContent = 'PLACE ORDER'; }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getCartFallback() {
    try { return JSON.parse(localStorage.getItem('glassico_cart')) || []; } catch { return []; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateStates();
    renderCartSummary();
    bindPaymentToggle();
    bindCardFormat();

    const form = document.getElementById('checkout-form');
    if (form) form.addEventListener('submit', handleSubmit);
  });
})();
