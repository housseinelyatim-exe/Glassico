(function () {
  'use strict';

  function bindTabs() {
    const tabs   = document.querySelectorAll('.auth-tab');
    const panels = document.querySelectorAll('.auth-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById('panel-' + target);
        if (panel) panel.classList.add('active');
        clearAllErrors();
      });
    });
  }

  function setError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-error');
    if (field) field.classList.toggle('error', !!msg);
    if (errEl) errEl.textContent = msg || '';
  }

  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input.error').forEach(el => el.classList.remove('error'));
  }

  function redirectAfterAuth(isAdmin) {
    window.location.href = isAdmin ? 'admin.html' : 'index.html';
  }
  function bindLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors();

      const email    = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value;
      let valid = true;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('login-email', 'Enter a valid email address.');
        valid = false;
      }
      if (!password || password.length < 1) {
        setError('login-password', 'Password is required.');
        valid = false;
      }
      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'ENTERING…'; }

      try {
        const res  = await fetch('api/auth.php?action=login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        });
        const json = await res.json();

        if (!json.success) throw new Error(json.error || 'Login failed.');

        redirectAfterAuth(!!json.data?.is_admin);
      } catch (err) {
        const globalErr = document.getElementById('login-global-error');
        if (globalErr) globalErr.textContent = err.message;
        if (btn) { btn.disabled = false; btn.textContent = 'ENTER THE GALLERY'; }
      }
    });
  }

  // ── Sign Up ───────────────────────────────────────────────────
  function bindSignup() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors();

      const firstName = document.getElementById('signup-first')?.value.trim();
      const lastName  = document.getElementById('signup-last')?.value.trim();
      const email     = document.getElementById('signup-email')?.value.trim();
      const password  = document.getElementById('signup-password')?.value;
      const confirm   = document.getElementById('signup-confirm')?.value;
      let valid = true;

      if (!firstName) { setError('signup-first', 'Required.'); valid = false; }
      if (!lastName)  { setError('signup-last',  'Required.'); valid = false; }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('signup-email', 'Enter a valid email address.');
        valid = false;
      }
      if (!password || password.length < 8) {
        setError('signup-password', 'Password must be at least 8 characters.');
        valid = false;
      }
      if (password !== confirm) {
        setError('signup-confirm', 'Passwords do not match.');
        valid = false;
      }
      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'CREATING…'; }

      try {
        const res  = await fetch('api/auth.php?action=signup', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
        });
        const json = await res.json();

        if (!json.success) throw new Error(json.error || 'Registration failed.');

        redirectAfterAuth(false);

      } catch (err) {
        const globalErr = document.getElementById('signup-global-error');
        if (globalErr) globalErr.textContent = err.message;
        if (btn) { btn.disabled = false; btn.textContent = 'CREATE ACCOUNT'; }
      }
    });
  }

  // ── Session check: keep auth page available for customers ─────
  async function checkSession() {
    try {
      const res  = await fetch('api/auth.php?action=session');
      const json = await res.json();
      if (json.success && json.data?.logged_in && json.data?.is_admin) {
        redirectAfterAuth(true);
      }
    } catch {}
  }

  function checkHashTab() {
    if (window.location.hash === '#signup') {
      const tab = document.querySelector('.auth-tab[data-tab="signup"]');
      if (tab) tab.click();
    }
  }

  // ── Init
  document.addEventListener('DOMContentLoaded', () => {
    bindTabs();
    bindLogin();
    bindSignup();
    checkSession();
    checkHashTab();
  });
})();
