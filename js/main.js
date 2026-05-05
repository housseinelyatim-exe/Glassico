// =============================================================
//  Glassico — Shared Layout Init (runs on every page)
//  Injects: announcement bar, navbar, footer
//  Also: active link detection, mobile menu, badge init
// =============================================================

(function () {
  'use strict';

  // ── Announcement Bar ─────────────────────────────────────────
  function createAnnouncementBar() {
    const bar = document.createElement('div');
    bar.className = 'announcement-bar';
    bar.innerHTML = 'Complimentary shipping on orders over 300 TND.';
    return bar;
  }

  // ── Navbar ────────────────────────────────────────────────────
  function createNavbar() {
    const path     = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    function activeClass(page) {
      return filename === page ? ' class="active"' : '';
    }

    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.id = 'main-navbar';
    nav.innerHTML = `
      <div class="navbar__inner">
        <div class="navbar__left">
          <a href="shop.html"${activeClass('shop.html')}>Shop</a>
          
        </div>
        <a href="index.html" class="navbar__logo">Glassico</a>

        <div class="navbar__right">
          
          <a href="cart.html" aria-label="Cart" style="position:relative;">
            <img src="images/cart.png" alt="cart" style="width: 20px; height: 20px;">
          </a>
          <a href="auth.html" aria-label="Account"><img src="images/profile.png" alt="Account" style="width: 20px; height: 20px;"></a>
        </div>

        <div class="navbar__hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="navbar__mobile-menu" id="mobile-menu">
        <a href="shop.html">Shop</a>
        <a href="cart.html">Cart</a>
        <a href="auth.html">Account</a>
      </div>
    `;
    return nav;
  }

  // ── Footer ────────────────────────────────────────────────────
  function createFooter() {
    const year = new Date().getFullYear();
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="footer__inner">
        <div class="footer__top">
          <div>
            <div class="footer__logo">Glassico</div>
            <p class="footer__tagline">Editorial eyewear for those who see differently. Handpicked, handcrafted, obsessively curated.</p>
          </div>
          <div class="footer__col">
            <h5>Help</h5>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">Frame Fitting Guide</a></li>
              <li><a href="#">Virtual Try-On</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h5>Policies</h5>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h5>Newsletter</h5>
            <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:12px;line-height:1.5;">Join the inner circle. New arrivals, exclusive edits.</p>
            <div class="footer__newsletter-form">
              <input type="email" placeholder="Your email" aria-label="Email for newsletter">
              <button type="button">JOIN</button>
            </div>
            <div style="margin-top:20px;display:flex;gap:16px;">
              <a href="#" style="color:rgba(255,255,255,0.5);font-size:20px;"><img src="images/facebook.png" alt="facebook" style="width: 24px; vertical-align: middle;"></a>
              <a href="#" style="color:rgba(255,255,255,0.5);font-size:20px;"><img src="images/instagram.png" alt="instagram" style="width: 24px; vertical-align: middle;"></a>
              <a href="#" style="color:rgba(255,255,255,0.5);font-size:20px;"><img src="images/github.png" alt="github" style="width: 24px; vertical-align: middle;"></a>
            </div>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${year} Glassico. All rights reserved.</span>
          <div style="display:flex;gap:24px;">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    `;
    return footer;
  }

  // ── Inject into DOM ───────────────────────────────────────────
  function init() {
    const body = document.body;

    // Announcement bar — prepend before everything
    body.insertBefore(createAnnouncementBar(), body.firstChild);

    // Navbar — after announcement bar
    const bar = body.querySelector('.announcement-bar');
    bar.insertAdjacentElement('afterend', createNavbar());

    // Footer — append at end (unless a footer already exists)
    if (!body.querySelector('footer')) {
      body.appendChild(createFooter());
    }

    // Mobile menu toggle
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
      });
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('open');
        }
      });
    }

    // Badge flash animation (inject keyframes if not present)
    if (!document.getElementById('badge-flash-style')) {
      const style = document.createElement('style');
      style.id = 'badge-flash-style';
      style.textContent = `
        @keyframes badgePop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.4); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .badge-flash { animation: badgePop 0.35s ease; }
      `;
      document.head.appendChild(style);
    }

    // Update cart badge (Cart module must be loaded before main.js OR we poll)
    if (window.Cart) {
      window.Cart.updateBadge();
    } else {
      // Fallback: read localStorage directly
      try {
        const cart  = JSON.parse(localStorage.getItem('glassico_cart')) || [];
        const count = cart.reduce((s, i) => s + (i.qty || 0), 0);
        document.querySelectorAll('.cart-badge').forEach(el => {
          el.textContent = count;
          el.style.display = count > 0 ? 'flex' : 'none';
        });
      } catch {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
